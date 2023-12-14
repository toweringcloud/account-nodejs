"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const utf8 = require("utf8");

const logger = require("./log");

// crypto value (32|24)
const _IV_DEF = "9zTvzr3p67VC61jmV54rIYu1545x4TlY"; // passphrase (key)
const _PP_DEF = "LWNpcmN1bHVzX3BpYm9eXg=="; // iv (default salt)

function $() {}

$.encB = (ori) => {
  const encBuf = Buffer.from(ori);
  return encBuf.toString("base64");
};

$.decB = (enc) => {
  const decBuf = Buffer.from(enc, "base64");
  return decBuf.toString("binary");
};

$.encC = (ori, iv = _IV_DEF) => {
  const cipher = crypto.createCipheriv("aes-256-ctr", _PP_DEF, $.decUB(iv));
  let enc = cipher.update(ori, "utf8", "hex");
  enc += cipher.final("hex");
  return enc;
};

$.decC = (enc, iv = _IV_DEF) => {
  const decipher = crypto.createDecipheriv("aes-256-ctr", _PP_DEF, $.decUB(iv));
  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

$.encG = (ori, iv = _IV_DEF) => {
  const cipher = crypto.createCipheriv("aes-256-gcm", _PP_DEF, $.decUB(iv));
  let enc = cipher.update(ori, "utf8", "hex");
  enc += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    content: enc,
    tag: tag,
  };
};

$.decG = (enc, iv = _IV_DEF) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", _PP_DEF, $.decUB(iv));
  decipher.setAuthTag(enc.tag);
  let dec = decipher.update(enc.content, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

$.encGB = (ori, iv = _IV_DEF) => {
  return new Promise((resolve, reject) => {
    try {
      const enc = $.encG(ori, $.decUB(iv));
      const decStr = JSON.stringify(enc);
      const encBuf = Buffer.from(decStr);
      const encB64 = encBuf.toString("base64");
      resolve(encB64);
    } catch (ex) {
      console.log("encGB", ex);
      reject(ex);
    }
  });
};

$.decGB = (encB64, iv = _IV_DEF) => {
  return new Promise((resolve, reject) => {
    try {
      const decBuf = Buffer.from(encB64, "base64");
      const decAsc = decBuf.toString("ascii");
      const decObj = JSON.parse(decAsc);
      decObj.tag = Buffer.from(decObj.tag);
      const decB64 = $.decG(decObj, $.decUB(iv));
      resolve(decB64);
    } catch (ex) {
      console.log("decGB", ex);
      reject(ex);
    }
  });
};

$.encU = (ori) => {
  return utf8.encode(ori);
};

$.decU = (enc) => {
  return utf8.decode(enc);
};

$.encUB = (ori) => {
  const encU8 = utf8.encode(ori);
  const encBuf = Buffer.from(encU8);
  return encBuf.toString("base64");
};

$.decUB = (enc) => {
  const decBuf = Buffer.from(enc, "base64");
  const decAsc = decBuf.toString("ascii");
  return utf8.decode(decAsc);
};

$.hash = (data, mode, part = 0) => {
  let result = null;
  const target = part > 0 ? new String(data).substring(0, part) : data;

  switch (mode) {
    case 0:
      result = crypto.createHash("md5").update(target).digest("hex");
      break;
    case 1:
      result = crypto.createHash("sha1").update(target).digest("hex");
      break;
    case 2:
      result = crypto.createHash("sha256").update(target).digest("hex");
      break;
    default:
      break;
  }
  return result;
};

$.hmac = (data, mode, key = _IV_DEF) => {
  let result = null;

  switch (mode) {
    case 0:
      result = crypto.createHmac("md5", key).update(data).digest("base64");
      break;
    case 1:
      result = crypto.createHmac("sha1", key).update(data).digest("base64");
      break;
    case 2:
      result = crypto.createHmac("sha256", key).update(data).digest("base64");
      break;
    default:
      break;
  }
  return result;
};

$.hashSalt = async (val) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info("UTIL", `! hashSalt.i : ${val}`);

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashed = await bcrypt.hash(val, salt);
      logger.info("UTIL", `! hashSalt.o : ${hashed}`);

      resolve(hashed);
    } catch (ex) {
      logger.error("UTIL", `@ hashSalt.e : ${ex}`);
      reject(ex);
    }
  });
};

$.signToken = (key, val, expireAfter = "99999d") => {
  return new Promise((resolve, reject) => {
    try {
      logger.info("UTIL", `! signToken.i : ${key} | ${val}`);

      jwt.sign(
        { val },
        key,
        { expiresIn: expireAfter, algorithm: "HS256" },
        (err, encoded) => {
          if (err) {
            logger.warn("UTIL", "$ signToken.w : " + err);
            return resolve({ result: false, data: err });
          }
          logger.info("UTIL", "! signToken.o : " + encoded);
          resolve({
            result: true,
            data: {
              val,
              accessToken: encoded,
            },
          });
        }
      );
    } catch (ex) {
      logger.error("UTIL", `@ signToken.e : ${ex}`);
      reject(ex);
    }
  });
};

$.verifyToken = (key, val) => {
  return new Promise((resolve, reject) => {
    try {
      logger.info("UTIL", `! verifyToken.i : ${key} | ${val}`);

      jwt.verify(val, key, (err, decoded) => {
        if (err) {
          logger.warn("UTIL", "$ verifyToken.w : " + err);
          return resolve({ result: false, data: err });
        }
        logger.info("UTIL", "! verifyToken.o : " + decoded);
        resolve({ result: true, data: decoded });
      });
    } catch (ex) {
      logger.error("UTIL", `@ verifyToken.e : ${ex}`);
      reject(ex);
    }
  });
};

module.exports = $;
