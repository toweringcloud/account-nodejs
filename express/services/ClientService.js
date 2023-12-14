"use strict";

const async = require("async");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbUtil = require("../utils/db");
const logger = require("../utils/log");
const secuUtil = require("../utils/security");

const Client = require("../models/Client");
const mongoose = require("mongoose");

/**
 * add new client with duplication check on clientId
 *
 * p_in : client object
 * returns client object
 **/
exports.createClient = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! createClient.i : " + JSON.stringify(p_in));

    const selectClient = (input, cbw) => {
      try {
        logger.info("LOGIC", "! selectClient.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const matchCond = {
          clientId: input.clientId,
        };
        logger.debug(
          "LOGIC",
          "# selectClient.c1 : " + JSON.stringify(matchCond)
        );

        Model.findOne(matchCond).exec((err, res) => {
          if (err) {
            logger.error("LOGIC", "@ selectClient.e : " + JSON.stringify(err));
            return cbw(err);
          }
          if (res) {
            logger.debug("LOGIC", "# selectClient.c2 : " + JSON.stringify(res));
            const warnMsg = `Duplicate client (${input.clientId}) already exist!`;
            logger.warn("LOGIC", "$ selectClient.w : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          } else {
            logger.info("LOGIC", "! selectClient.o : " + JSON.stringify(input));
            return cbw(null, { result: true, data: input });
          }
        });
      } catch (ex) {
        logger.error("LOGIC", "@ selectClient.e : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    const insertClient = (check, cbw) => {
      try {
        logger.info("LOGIC", "! insertClient.i : " + JSON.stringify(check));
        if (!check.result) return cbw(null, check);
        const input = check.data;

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        secuUtil
          .hashSalt(input.clientPw)
          .then((r1) => {
            const doc = new Model({
              clientId: input.clientId,
              clientPw: r1,
              clientName: input.clientName,
              clientType: input.clientType,
              createdAt: new Date(),
              firstTime: Date.now(),
              use: true,
            });
            logger.debug("LOGIC", "# insertClient.c1 : " + JSON.stringify(doc));

            doc.save((e2, r2) => {
              if (e2) {
                logger.error(
                  "LOGIC",
                  "@ insertClient.e : " + JSON.stringify(e2)
                );
                return cbw(e2);
              }
              logger.debug(
                "LOGIC",
                "# insertClient.c2 : " + JSON.stringify(r2)
              );
              const output = {
                docId: r2._id,
                clientId: doc.clientId,
                clientName: doc.clientName,
                clientType: doc.clientType,
                createdAt: doc.createdAt,
              };
              logger.info(
                "LOGIC",
                "! insertClient.o : " + JSON.stringify(output)
              );
              return cbw(null, { result: true, data: output });
            });
          })
          .catch((e1) => {
            logger.error("LOGIC", "@ insertClient.e1 : " + JSON.stringify(e1));
            return cbw(e1);
          });
      } catch (ex) {
        logger.error("LOGIC", "@ insertClient.e : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall(
      [(cbw) => selectClient(p_in, cbw), insertClient],
      (err, res) => {
        if (err) {
          logger.error("LOGIC", "@ createClient.e : " + JSON.stringify(err));
          return reject(err);
        }
        logger.info("LOGIC", "! createClient.o : " + JSON.stringify(res));
        resolve(res);
      }
    );
  });
};

/**
 * query clients matching search conditions
 *
 * p_in : search conditions
 * returns client objects
 **/
exports.listClients = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! listClients.i : " + JSON.stringify(p_in));

    const selectClients = (input, cbw) => {
      try {
        logger.info("LOGIC", "! selectClients.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const searchCond = {
          // clientName: { $regex: /^(searchCond.keyword)/ },
          clientType: { $in: ["S", "U", "Z"] },
          use: true,
        };
        const projection = {
          clientId: 1,
          clientName: 1,
          clientType: 1,
          createdAt: 1,
        };
        const sortCond = {
          clientId: 1,
        };

        Model.find(searchCond, projection)
          .sort(sortCond)
          .skip(input.offset)
          .limit(input.limit)
          .exec((err, res) => {
            if (err) {
              logger.error(
                "LOGIC",
                "@ selectClients.e : " + JSON.stringify(err)
              );
              return cbw(err);
            }
            if (res && res.length > 0) {
              logger.info(
                "LOGIC",
                "! selectClients.o : " + JSON.stringify(res)
              );
              return cbw(null, { result: true, data: res });
            } else {
              return cbw(null, { result: false, data: [] });
            }
          });
      } catch (ex) {
        logger.error("LOGIC", "@ selectClients.e : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall([(cbw) => selectClients(p_in, cbw)], (err, res) => {
      if (err) {
        logger.error("LOGIC", "@ listClients.e : " + JSON.stringify(err));
        return reject(err);
      }
      logger.info("LOGIC", "! listClients.o : " + JSON.stringify(res));
      resolve(res);
    });
  });
};

/**
 * find client matching clientId
 *
 * p_in : client id
 * returns client object
 **/
exports.readClient = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! readClient.i : " + JSON.stringify(p_in));

    const selectClient = (input, cbw) => {
      try {
        logger.info("LOGIC", "! selectClient.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const matchCond = {
          clientId: input.clientId,
          use: true,
        };
        logger.debug(
          "LOGIC",
          "# selectClient.c : " + JSON.stringify(matchCond)
        );

        Model.findOne(matchCond).exec((err, res) => {
          if (err) {
            logger.error("LOGIC", "@ selectClient.e : " + JSON.stringify(err));
            return cbw(err);
          }
          if (res) {
            logger.info("LOGIC", "! selectClient.o : " + JSON.stringify(res));
            return cbw(null, { result: true, data: res });
          } else {
            const warnMsg = `No client matching clientId=${input.clientId}`;
            logger.warn("LOGIC", "$ selectClient.w : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          }
        });
      } catch (ex) {
        logger.error("LOGIC", "@ selectClient.e : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall([(cbw) => selectClient(p_in, cbw)], (err, res) => {
      if (err) {
        logger.error("LOGIC", "@ readClient.e : " + JSON.stringify(err));
        return reject(err);
      }
      logger.info("LOGIC", "! readClient.o : " + JSON.stringify(res));
      resolve(res);
    });
  });
};

/**
 * modify client matching clientId
 *
 * p_in : client object
 * returns client object
 **/
exports.updateClient = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! updateClient.i : " + JSON.stringify(p_in));

    const updateMeta = async (input, cbw) => {
      try {
        logger.info("LOGIC", "! updateMeta.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const matchCond = {
          _id: mongoose.Types.ObjectId(input.docId),
          use: true,
        };
        logger.debug("LOGIC", "# updateMeta.c1 : " + JSON.stringify(matchCond));

        const doc = {
          updatedAt: new Date(),
          lastTime: Date.now(),
        };
        if (input.clientPw)
          doc.clientPw = await secuUtil.hashSalt(input.clientPw);
        if (input.clientName) doc.clientName = input.clientName;
        if (input.clientType) doc.clientType = input.clientType;
        logger.debug("LOGIC", "# updateMeta.c2 : " + JSON.stringify(doc));

        Model.updateOne(matchCond, { $set: doc }, (err, res) => {
          if (err) {
            logger.error("LOGIC", "@ updateMeta.e1 : " + JSON.stringify(err));
            return cbw(err);
          }
          if (
            res &&
            res.acknowledged &&
            res.matchedCount > 0 &&
            res.modifiedCount > 0
          ) {
            logger.info("LOGIC", "! updateMeta.o : " + JSON.stringify(res));
            res.docId = input.docId;
            res.activated = doc.use;
            return cbw(null, { result: true, data: res });
          } else if (
            res &&
            res.acknowledged &&
            res.matchedCount > 0 &&
            res.modifiedCount == 0
          ) {
            const warnMsg = `No data to modify on docId=${input.docId}`;
            logger.warn("LOGIC", "$ updateMeta.w1 : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          } else {
            const warnMsg = `No client matching docId=${input.docId}`;
            logger.warn("LOGIC", "$ updateMeta.w2 : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          }
        });
      } catch (ex) {
        logger.error("LOGIC", "@ updateMeta.e0 : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall([(cbw) => updateMeta(p_in, cbw)], (err, res) => {
      if (err) {
        logger.error("LOGIC", "@ updateClient.e : " + JSON.stringify(err));
        return reject(err);
      }
      logger.info("LOGIC", "! updateClient.o : " + JSON.stringify(res));
      resolve(res);
    });
  });
};

/**
 * remove client matching clientId
 *
 * p_in : client id
 * returns client object
 **/
exports.deleteClient = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! deleteClient.i : " + JSON.stringify(p_in));

    const dropClient = (input, cbw) => {
      try {
        logger.info("LOGIC", "! dropClient.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const matchCond = {
          _id: mongoose.Types.ObjectId(input.docId),
        };
        logger.debug("LOGIC", "# dropClient.c1 : " + JSON.stringify(matchCond));

        Model.deleteOne(matchCond).exec((err, res) => {
          if (err) {
            logger.error("LOGIC", "@ dropClient.e1 : " + JSON.stringify(err));
            return cbw(err);
          }
          if (res && res.acknowledged && res.deletedCount > 0) {
            logger.info("LOGIC", "! dropClient.o : " + JSON.stringify(res));
            res.docId = input.docId;
            res.pamanentlyDeleted = true;
            return cbw(null, { result: true, data: res });
          } else {
            const warnMsg = `No client matching docId=${input.docId}`;
            logger.warn("LOGIC", "$ dropClient.w : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          }
        });
      } catch (ex) {
        logger.error("LOGIC", "@ dropClient.e0 : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall([(cbw) => dropClient(p_in, cbw)], (err, res) => {
      if (err) {
        logger.error("LOGIC", "@ deleteClient.e : " + JSON.stringify(err));
        return reject(err);
      }
      logger.info("LOGIC", "! deleteClient.o : " + JSON.stringify(res));
      resolve(res);
    });
  });
};

/**
 * change client's status matching clientId
 *
 * p_in : client object
 * returns client object
 **/
exports.statusClient = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! statusClient.i : " + JSON.stringify(p_in));

    const updateStatus = (input, cbw) => {
      try {
        logger.info("LOGIC", "! updateStatus.i : " + JSON.stringify(input));

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        const matchCond = {
          _id: mongoose.Types.ObjectId(input.docId),
        };
        logger.debug(
          "LOGIC",
          "# updateStatus.c1 : " + JSON.stringify(matchCond)
        );

        const doc = {
          use: input.use,
          updatedAt: new Date(),
          lastTime: Date.now(),
        };
        logger.debug("LOGIC", "# updateStatus.c2 : " + JSON.stringify(doc));

        Model.updateOne(matchCond, { $set: doc }, (err, res) => {
          if (err) {
            logger.error("LOGIC", "@ updateStatus.e : " + JSON.stringify(err));
            return reject(err);
          }
          if (
            res &&
            res.acknowledged &&
            res.matchedCount > 0 &&
            res.modifiedCount > 0
          ) {
            logger.info("LOGIC", "! updateStatus.o : " + JSON.stringify(res));
            res.docId = input.docId;
            res.activated = doc.use;
            return cbw(null, { result: true, data: res });
          } else if (
            res &&
            res.acknowledged &&
            res.matchedCount > 0 &&
            res.modifiedCount == 0
          ) {
            const warnMsg = `No data to change on docId=${input.docId}`;
            logger.warn("LOGIC", "$ updateStatus.w1 : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          } else {
            const warnMsg = `No client matching docId=${input.docId}`;
            logger.warn("LOGIC", "$ updateStatus.w2 : " + warnMsg);
            return cbw(null, { result: false, data: warnMsg });
          }
        });
      } catch (ex) {
        logger.error("LOGIC", "@ updateStatus.e : " + ex.stack);
        return cbw(ex.stack);
      }
    };

    async.waterfall([(cbw) => updateStatus(p_in, cbw)], (err, res) => {
      if (err) {
        logger.error("LOGIC", "@ statusClient.e : " + JSON.stringify(err));
        return reject(err);
      }
      logger.info("LOGIC", "! statusClient.o : " + JSON.stringify(res));
      resolve(res);
    });
  });
};

/**
 * verify client and issue access token
 *
 * p_in : client object
 * returns client object
 **/
exports.login = (p_in) => {
  return new Promise((resolve, reject) => {
    logger.info("LOGIC", "! login.i : " + JSON.stringify(p_in));

    const verifyClient = (input, cbw) => {
      try {
        logger.info("LOGIC", "! verifyClient.i : " + JSON.stringify(input));
        const { clientId, clientPw } = input;

        const mci = dbUtil.getMongoClient();
        const Model = mci.model("Client", Client);

        Model.findOne({ clientId: clientId }).exec(async (err, res) => {
          if (err) {
            logger.error("LOGIC", "@ verifyClient.e1 : " + err);
            return cbw(err);
          }
          logger.info("LOGIC", "! verifyClient.c1 : " + JSON.stringify(res));
          if (res && res.clientPw) {
            const verified = await bcrypt.compare(clientPw, res.clientPw);
            logger.info("LOGIC", "! verifyClient.c2 : " + verified);
            input.verified = verified;
            return cbw(null, { result: true, data: input });
          } else {
            const res = {
              result: false,
              data: { errMsg: `clientId (${clientId}) not exists!` },
            };
            logger.warn("LOGIC", "$ verifyClient.w1 : " + JSON.stringify(res));
            return cbw(null, res);
          }
        });
      } catch (err) {
        logger.error("LOGIC", "@ verifyClient.e : " + JSON.stringify(err));
        return cbw(err);
      }
    };

    const issueToken = (input, cbw) => {
      try {
        logger.info("LOGIC", "! issueToken.i : " + JSON.stringify(input));
        if (!input.result) return cbw(null, input);

        const { verified, secretKey, clientId, clientPw } = input.data;

        if (verified) {
          secuUtil
            .signToken(secretKey, clientId)
            .then((r1) => {
              const res = {
                result: true,
                data: { clientId, verified, accessToken: r1.data.accessToken },
              };
              logger.info("LOGIC", "! issueToken.o : " + JSON.stringify(res));
              return cbw(null, res);
            })
            .catch((e1) => {
              logger.error("LOGIC", "@ issueToken.e1 : " + e1);
              return cbw(e1);
            });
        } else {
          const res = {
            result: false,
            data: { errMsg: `invalid credential (${clientPw})!` },
          };
          logger.warn("LOGIC", "$ issueToken.w : " + JSON.stringify(res));
          return cbw(null, res);
        }
      } catch (err) {
        logger.error("LOGIC", "@ issueToken.e : " + JSON.stringify(err));
        return cbw(err);
      }
    };

    async.waterfall(
      [(cbw) => verifyClient(p_in, cbw), issueToken],
      (err, res) => {
        if (err) {
          logger.error("LOGIC", "@ login.e : " + JSON.stringify(err));
          return reject(err);
        }
        logger.info("LOGIC", "! login.o : " + JSON.stringify(res));
        resolve(res);
      }
    );
  });
};
