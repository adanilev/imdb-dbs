// This script is to be run after dataImport.sh
// Here, we transform the data to the way we want for the queries

var fs = require('fs');
var async = require('async');
var firstline = require('firstline');


exports.preprocess = function(config, callback) {
  console.log("Pre-processing data");
  // Runs the functions in the array one after the other
  async.waterfall([
    function(cb) {
      return getHeaderData(config, cb);
    },
    setNulls
  ], function(err, res) {
    if (err)
      console.error('Error in final waterfall callback: ' + err);

    console.log('Done pre-processing data');
    callback();
  });
}


// Return an object with all of the header data from the datasets
function getHeaderData(config, callback) {
  var headerData = [];

  async.each(
    // Pass the values of this array
    config.datasets,
    // To this function
    function(dataset, cb) {
      firstline('../data-files/originals/' + dataset.filename)
      .then((headerLine) => {
        var hd = {
          collectionName: dataset.collection,
          headers: headerLine.split('\t')
        };
        headerData.push(hd);
        cb();
      })
      .catch((err) => {
        console.error('firstline error: ' + err);
      })
    },
    // Then callback after they all completed
    function(err) {
      if (err)
        console.error('getHeaderData error: ' + err);
      callback(null, headerData);
    });
}


// Replace \\N with null for all blank fields
function setNulls(headerData, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://localhost:27017/imdb';

  MongoClient.connect(url, function(err, db) {

    // For each file
    async.eachSeries(headerData, function(hd, cbk) {
      console.log('...Setting nulls in ' + hd.collectionName);
      var collection = db.collection(hd.collectionName);
      
      // For each header/column
      async.eachSeries(hd.headers, function(header, cb) {
        var findQuery = {};
        var setStmt = {};
        findQuery[header] = "\\N";
        setStmt[header] = null;
        
        // Set any \\N value to null
        collection.updateMany(findQuery, {$set: setStmt}, function(err, res) {
          if (err) {
            cb(err);
          } else {
            console.log('......' + res.modifiedCount + ' ' + header + ' records updated');
            cb();
          }
        });
        
      }, function(err) {
        if (err)
          console.error('Error in setNulls async: ' + err);
        cbk();
      });

    }, function(err) {
      if (err)
        console.error('Error in setNulls async: ' + err);
      db.close();
      callback();
    });

  });
}
