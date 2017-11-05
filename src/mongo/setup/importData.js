var fs = require('fs');
var child_process = require('child_process');
var async = require('async');

var datafileDir = process.env.IMDB_DBS_HOME + '/data-files/originals/';
var datafileDirShort =
  process.env.IMDB_DBS_HOME + '/data-files/originals-short/';

// Create the short versions of the original files
exports.createShortDatafiles = function(config, numRows, callback) {
  console.log('Creating short versions of the datafiles');
  // Pass each element of config.datasets to this non-async
  async.eachSeries(
    config.datasets,
    function(ds, cb) {
      var realCommand = `head -${numRows} ${datafileDir}${ds.filename} > ${datafileDirShort}${ds.filename}`;
      var options = ['-c', realCommand];

      executeCommand('sh', options, cb);
    },
    function(err) {
      // Once all complete or an error
      if (err) {
        callback('createShortDatafiles error: ' + err);
      } else {
        console.log('...Done creating short versions');
        callback();
      }
    }
  );
};

// Import the data into MongoDB
exports.mongoImport = function(config, callback) {
  console.log('Importing the data to mongo');
  // Do one at a time for now. Try timing and then run in parallel and compare later.
  async.eachSeries(
    config.datasets,
    function(ds, cb) {
      var realCommand = `docker exec imdb-mongo sh -c "mongoimport --db imdb --collection ${ds.collection} --type tsv --headerline --file /data/import/${ds.filename}"`;
      var options = ['-c', realCommand];

      console.log('...importing: ' + ds.filename);
      executeCommand('sh', options, cb);
    },
    function(err) {
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

// Execute the command and output everything to sdout. Optional callback
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
