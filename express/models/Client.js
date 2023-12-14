"use strict";

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  _id: { type: mongoose.Types.ObjectId, auto: true },
  clientId: { type: String, required: true },
  clientPw: { type: String },
  clientName: { type: String },
  clientType: { type: String },
  createdAt: { type: Date, default: new Date() },
  firstTime: { type: Number, default: Date.now() },
  use: { type: Boolean, default: true, require: true },
});

module.exports = schema;
