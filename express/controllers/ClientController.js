"use strict";

const errFilter = require("../utils/error");
const logger = require("../utils/log");
const resUtil = require("../utils/writer");

const clientService = require("../services/ClientService");

/**
 * [C] add new client info
 */
module.exports.addClient = (req, res, next) => {
  const client = req.body;
  logger.info("ROUTE", "! addClient.i : " + JSON.stringify(client));

  clientService
    .createClient(client)
    .then((r1) => {
      logger.info("ROUTE", "! addClient.o : " + JSON.stringify(r1));
      res.payload = r1;
      resUtil.writeJson(res, r1);
    })
    .catch((e1) => {
      logger.error("ROUTE", "@ addClient.e : " + JSON.stringify(e1));
      const resErr = errFilter.getErrData(e1);
      res.payload = { result: false, data: resErr[1] };
      resUtil.writeJson(res, res.payload, resErr[0]);
    });
};

/**
 * [R] search client list
 */
module.exports.searchClients = (req, res, next) => {
  const div = req.query["list"];

  if (div == "Y") {
    const searchCond = {
      offset: req.query["offset"] || 0,
      limit: req.query["limit"] || 10,
    };
    logger.info("ROUTE", "! searchClients.i : " + JSON.stringify(searchCond));

    clientService
      .listClients(searchCond)
      .then((r1) => {
        logger.info("ROUTE", "! searchClients.o : " + JSON.stringify(r1));
        res.payload = r1;
        resUtil.writeJson(res, r1);
      })
      .catch((e1) => {
        logger.error("ROUTE", "@ searchClients.e : " + JSON.stringify(e1));
        const resErr = errFilter.getErrData(e1);
        res.payload = {
          result: false,
          data: { code: "UL00", message: resErr[1] },
        };
        resUtil.writeJson(res, res.payload, resErr[0]);
      });
  } else {
    const client = { clientId: req.query["clientId"] };
    logger.info("ROUTE", "! findClient.i : " + JSON.stringify(client));

    clientService
      .readClient(client)
      .then((r1) => {
        logger.info("ROUTE", "! findClient.o : " + JSON.stringify(r1));
        res.payload = r1;
        resUtil.writeJson(res, r1);
      })
      .catch((e1) => {
        logger.error("ROUTE", "@ findClient.e : " + JSON.stringify(e1));
        const resErr = errFilter.getErrData(e1);
        res.payload = {
          result: false,
          data: { code: "UR00", message: resErr[1] },
        };
        resUtil.writeJson(res, res.payload, resErr[0]);
      });
  }
};

/**
 * [U] modify specific client info
 */
module.exports.modifyClient = (req, res, next) => {
  const client = req.body;
  client.docId = req.path.split("/")[req.path.split("/").length - 1];
  logger.info("ROUTE", "! modifyClient.i : " + JSON.stringify(client));

  clientService
    .updateClient(client)
    .then((r1) => {
      logger.info("ROUTE", "! modifyClient.o : " + JSON.stringify(r1));
      res.payload = r1;
      resUtil.writeJson(res, r1);
    })
    .catch((e1) => {
      logger.error("ROUTE", "@ modifyClient.e : " + JSON.stringify(e1));
      const resErr = errFilter.getErrData(e1);
      res.payload = { result: false, data: resErr[1] };
      resUtil.writeJson(res, res.payload, resErr[0]);
    });
};

/**
 * [D] remove specific client info
 */
module.exports.removeClient = (req, res, next) => {
  const docId = req.path.split("/")[req.path.split("/").length - 1];
  const client = { docId: docId };
  logger.info("ROUTE", "! removeClient.i : " + JSON.stringify(client));

  clientService
    .deleteClient(client)
    .then((r1) => {
      logger.info("ROUTE", "! removeClient.o : " + JSON.stringify(r1));
      res.payload = r1;
      resUtil.writeJson(res, r1);
    })
    .catch((e1) => {
      logger.error("ROUTE", "@ removeClient.e : " + JSON.stringify(e1));
      const resErr = errFilter.getErrData(e1);
      res.payload = { result: false, data: resErr[1] };
      resUtil.writeJson(res, res.payload, resErr[0]);
    });
};

/**
 * [S] change specific client status
 */
module.exports.changeClient = (req, res, next) => {
  const docId = req.path.split("/")[req.path.split("/").length - 1];
  const status = req.query["activated"] == "Y" ? true : false;
  const client = { docId: docId, use: status };
  logger.info("ROUTE", "! changeClient.i : " + JSON.stringify(client));

  clientService
    .statusClient(client)
    .then((r1) => {
      logger.info("ROUTE", "! changeClient.o : " + JSON.stringify(r1));
      res.payload = r1;
      resUtil.writeJson(res, r1);
    })
    .catch((e1) => {
      logger.error("ROUTE", "@ changeClient.e : " + JSON.stringify(e1));
      const resErr = errFilter.getErrData(e1);
      res.payload = { result: false, data: resErr[1] };
      resUtil.writeJson(res, res.payload, resErr[0]);
    });
};

/**
 * [A] login and issue access token
 */
module.exports.authClient = (req, res, next) => {
  const client = req.body;
  client.secretKey = req.mode.JWT_ACCESS_TOKEN_SECRET;
  logger.info("ROUTE", "! authClient.i : " + JSON.stringify(client));

  clientService
    .login(client)
    .then((r1) => {
      logger.info("ROUTE", "! authClient.o : " + JSON.stringify(r1));
      res.payload = r1;
      resUtil.writeJson(res, r1);
    })
    .catch((e1) => {
      logger.error("ROUTE", "@ authClient.e : " + JSON.stringify(e1));
      const resErr = errFilter.getErrData(e1);
      res.payload = { result: false, data: resErr[1] };
      resUtil.writeJson(res, res.payload, resErr[0]);
    });
};
