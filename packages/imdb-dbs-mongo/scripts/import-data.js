'use strict'

const config = require('imdb-dbs-common').config.mongo;

const fs = require('fs');
const child_process = require('child_process');
const async = require('async');

const dataDir = process.env.IMDB_DATA_DIR + '/originals/';
const dataDirTrunc = process.env.IMDB_DATA_DIR + '/truncated/';


// Execute the command and output everything to sdout. Optional callback
// Perhaps should refactor to use shelljs for consistency
function executeCommand(command, options, callback) {
  // Run the command
  var cmd = child_process.spawn(command, options);
  // Log stdout
  cmd.stdout.on('data', data => {
    console.log(`${data}`.replace(/\n$/, ''));
  });
  // Log stderr
  cmd.stderr.on('data', data => {
    console.error(`${data}`.replace(/\n$/, ''));
  });
  // Then call home
  cmd.on('close', code => {
    if (typeof callback !== 'undefined') {
      if (code > 0) {
        callback('Error executing command ' + command + ' ' + options);
      } else {
        callback();
      }
    }
  });
}

// Create the short versions of the original imdb files for testing
exports.createTruncatedDatafiles = function (numRows, callback) {
  console.log('Creating truncated versions of the datafiles');
  // Pass each element of config.datasets to this non-async
  async.eachSeries(
    config.datasets,
    function (ds, cb) {
      var realCommand = `head -${numRows} ${dataDir}${ds.filename} > ${dataDirTrunc}${ds.filename}`;
      var options = ['-c', realCommand];

      executeCommand('sh', options, cb);
    },
    function (err) {
      // Once all complete or an error
      if (err) {
        callback('createTruncatedDatafiles error: ' + err);
      } else {
        console.log('...Done creating short versions');
        callback();
      }
    }
  );
};

// Import the data into MongoDB
exports.mongoImport = function (callback) {
  console.log('Importing the data to mongo');
  // Do one at a time for now. TODO: Try timing and then run in parallel and compare later.
  async.eachSeries(
    config.datasets,
    function (ds, cb) {
      var realCommand = `docker exec imdb-mongo sh -c "mongoimport --db ${config.dbName} --collection ${ds.collection} --type tsv --headerline --file /data/import/${ds.filename}"`;
      var options = ['-c', realCommand];

      console.log('...importing: ' + ds.filename);
      executeCommand('sh', options, cb);
    },
    function (err) {
      // Once all complete or an error
      if (err) {
        callback('importData error: ' + err);
      } else {
        console.log('...Done importing data');
        callback();
      }
    }
  );
};
