"use strict";

function $() {}

// https://www.unixtimestamp.com
$.timeConverter = (UNIX_timestamp, mode) => {
  const realTime = UNIX_timestamp == 0 ? new Date() : new Date(UNIX_timestamp);
  const timeZone = "+09:00";

  let y = realTime.getFullYear().toString();
  let m = (realTime.getMonth() + 1).toString();
  let d = realTime.getDate().toString();
  let hr = realTime.getHours();
  let mi = realTime.getMinutes();
  let se = realTime.getSeconds();

  d.length == 1 && (d = "0" + d);
  m.length == 1 && (m = "0" + m);
  let ymnd = y + m;
  let ymdnd = ymnd + d;
  let yyyymm = y + "-" + m;
  let yyyymmdd = yyyymm + "-" + d;

  let hrs = hr.toString().length == 1 ? "0" + hr : hr;
  let mis = mi.toString().length == 1 ? "0" + mi : mi;
  let ses = se.toString().length == 1 ? "0" + se : se;
  let hmsnd = hrs + mis + ses;
  let hhmiss = hrs + ":" + mis + ":" + ses;

  let time = "";
  switch (mode) {
    case 0:
      time = yyyymm;
      break;
    case 1:
      time = yyyymmdd;
      break;
    case 2:
      time = yyyymmdd + "T" + hhmiss;
      break;
    case 3:
      time = yyyymmdd + "T" + hhmiss + timeZone;
      break;
    case 90:
      time = ymnd;
      break;
    case 91:
      time = ymdnd;
      break;
    case 92:
      time = ymdnd + hmsnd;
      break;
    default:
      time = realTime;
      break;
  }
  return time;
};

module.exports = $;
