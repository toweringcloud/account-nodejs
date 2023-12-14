"use strict";

const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, label, printf } = format;
const myFormat = printf(
  ({ label: module, level, message, timestamp: printTS }) =>
    `${printTS} - ${level
      .toUpperCase()
      .charAt(
        0
      )} - ${$.getDomain()} - ${$.getSession()} - ${$.getClient()} - ${module} - ${message}`
);

let logger = {};
let domainPrefix = null;
let logLevel = "warn";
let clientId = "unknown";
let sessionId = "????????-????-????-????-????????????";

function $() {}

$.getDomain = () => {
  return domainPrefix;
};

$.getLevel = () => {
  return logLevel;
};

$.getClient = () => {
  return clientId;
};

$.getSession = () => {
  return sessionId;
};

$.setupDomain = (_domainPrefix) => {
  domainPrefix = _domainPrefix;
};

$.setupLevel = (_logLevel) => {
  logLevel = _logLevel;
};

$.setupClient = (_clientId) => {
  clientId = _clientId;
};

$.setupSession = (_sessionId) => {
  sessionId = _sessionId;
};

$.error = (module, msg) => {
  if (!logger[module]) {
    $.createLogger(module);
  }
  logger[module].log("error", msg);
};

$.warn = (module, msg) => {
  if (!logger[module]) {
    $.createLogger(module);
  }
  logger[module].log("warn", msg);
};

$.info = (module, msg) => {
  if (!logger[module]) {
    $.createLogger(module);
  }
  logger[module].log("info", msg);
};

$.debug = (module, msg) => {
  if (!logger[module]) {
    $.createLogger(module);
  }
  logger[module].log("debug", msg);
};

$.createLogger = (type) => {
  logger[type] = createLogger({
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      label({ label: type }),
      myFormat
    ),
    level: $.getLevel(),
    levels: { error: 0, warn: 1, info: 2, debug: 3 },
    transports: [
      new transports.Console(),
      new DailyRotateFile({
        filename: `log/${$.getDomain()}.%DATE%.log`,
        datePattern: "YYYYMMDD",
      }),
    ],
  });
};

$.createLoggers = (types) => {
  types.forEach((type) => {
    $.createLogger(type);
  });
};

module.exports = $;
