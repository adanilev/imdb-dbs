var fs = require('fs');  
var child_process = require('child_process');
var async = require('async');

var datafileDir = '/Users/adanilev/dev/imdb-dbs/data-files/originals/';
var datafileDirShort = '/Users/adanilev/dev/imdb-dbs/data-files/originals-short/'; 


exports.importData = function(config) {

  console.log('in importData');
  
};


// Create the short versions of the original files
exports.createShortDatafiles = function(config) {

  async.eachSeries(config.datasets, function(ds, callback) {

    var realCommand = 'head -10 ' + datafileDir + ds.filename + ' > ' + datafileDirShort + ds.filename;
    var options = ['-c', realCommand];

    console.log('...creating short version: ' + ds.filename);
    executeCommand('sh', options, callback);

  }, function(err) {
    if (err) console.error('createShortDatafiles error: ' + err);
    console.log('Done creating short versions')
  });
  
}


// Execute the command and output everything to sdout
function executeCommand(command, options, callback) {

  var cmd = child_process.spawn(command, options);
    
  cmd.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  cmd.stderr.on('data', (data) => {
    console.log(`Error running command: ${data}`);
  });
  
  cmd.on('close', (code) => {
    if (callback) callback();
  });

}