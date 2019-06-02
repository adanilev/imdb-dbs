'use strict'

require('dotenv-expand')(require('dotenv').config());
const config = require('imdb-dbs-common').config.mongo;

const fs = require('fs');
const async = require('async');

const util = require('imdb-dbs-common').utilityFuncs;
const startDb = require('./start-db');
const importData = require('./import-data');
const preprocess = require('./preprocess');

//TODO: check if the IMDB_DATA_DIR exists, if not, create it
//TODO: first download the imdb data if it's not there
async.series(
  [
    function (next) {
      if (util.toBoolean(process.env.USE_TRUNC_FILES)) {
        importData.createTruncatedDatafiles(config.numTruncatedRows, next);
      } else {
        next();
      }
    },
    function (next) {
      startDb.start(next);
    },
    function (next) {
      importData.mongoImport(next);
    },
    function (next) {
      preprocess.preprocess(next);
    }
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log('Finished building database');
    }
  }
);