"use strict";

const mongoose = require("mongoose");

const logger = require("./log");

let dbConf = { mongo: null };
let mongoClient = { main: null };

function $() {}

$.initMongoClient = (opt) => {
	return new Promise((resolve, reject) => {
		try {
			if (opt) dbConf.mongo = opt;
			let cfg = opt ? opt : dbConf.mongo;

			const uri1 = `mongodb://${cfg.dbid}:${cfg.dbpw}@${cfg.host}:${cfg.port}/${cfg.dbnm}`;

			const opts = {
				maxPoolSize: cfg.dbps,
				useUnifiedTopology: true,
				useNewUrlParser: true,
			};
			logger.info("UTIL", `! db.mongo.i : ${JSON.stringify(cfg)}`);

			const con1 = mongoose.createConnection(uri1, opts);
			con1.on("error", () => {
				logger.error(
					"UTIL",
					`@ db.mongo.e1 : failed to connect to mongodb server on port ${cfg.port}`
				);
				return resolve(null);
			});
			con1.once("open", () => {
				mongoClient.main = con1;
				logger.debug(
					"UTIL",
					`# db.mongo.c1 : ${
						mongoose.version
					} | ${mongoose.now()} | ${Object.keys(mongoClient.main)}`
				);
				logger.info(
					"UTIL",
					`! db.mongo.o1 : connected to mongodb server on port ${cfg.port} /w ${mongoClient.main.name}`
				);
				resolve(mongoClient);
			});
		} catch (ex) {
			logger.warn("UTIL", `$ db.mongo.w : ${ex}`);
			reject(ex);
		}
	});
};

$.getMongoClient = (ext = null) => {
	if (!mongoClient.main) {
		$.initMongoClient(null).then((mci) => {
			logger.warn(
				"UTIL",
				`$ getMongoClient.w : ${
					ext == null ? mci.main.name : mci[`${ext}`].name
				}`
			);
			return ext == null ? mci.main : mci[`${ext}`];
		});
	} else {
		logger.info(
			"UTIL",
			`! getMongoClient.c : ${
				ext == null ? mongoClient.main.name : mongoClient[`${ext}`].name
			}`
		);
		return ext == null ? mongoClient.main : mongoClient[`${ext}`];
	}
};

module.exports = $;
