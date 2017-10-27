var importData = require('./importData');
var preprocess = require('./preprocess');

var fs = require('fs');
var async = require('async');
var config = JSON.parse(fs.readFileSync('./config.json'));


async.series([
  function(next) {
    importData.createShortDatafiles(config, 1000, next);
  },
  function(next) {
    importData.mongoImport(config, next);
  },
  function(next) {
    preprocess.preprocess(config, next);
  },
],
function(err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log('ALL DONE!!');
  }
});
