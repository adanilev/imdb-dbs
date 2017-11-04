require('dotenv').config();
var importData = require('./importData');
var preprocess = require('./preprocess');

var fs = require('fs');
var async = require('async');
var config = JSON.parse(fs.readFileSync('./config.json'));

// TODO: move .env to root dir and figure out how to jive that with the bash scripts so only storing things once
// TODO: move the DB_URL from config to .env

async.series(
  [
    function(next) {
      importData.createShortDatafiles(config, 1001, next);
    },
    function(next) {
      importData.mongoImport(config, next);
    },
    function(next) {
      preprocess.preprocess(config, next);
    }
  ],
  function(err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log('All done!!!');
    }
  }
);
