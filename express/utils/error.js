"use strict";

function $() {}

$.getErrData = (err) => {
  const target = new String(err);
  if (target.indexOf("Argument passed in must be") != -1) {
    return [400, "TypeError: Invalid ID, check ObjectId format valid"];
  } else if (target.indexOf("Cast to date failed for value") != -1) {
    return [400, "CastError: Invalid Date, check date format yyyy-MM-dd"];
  } else if (target.indexOf("no permission") != -1) {
    return [403, "ForbiddenError: such operation not permitted"];
  } else if (target.indexOf("not available") != -1) {
    return [404, "ResourceError: " + target];
  } else {
    return [500, target.substr(0, target.length < 100 ? target.length : 100)];
  }
};

module.exports = $;
