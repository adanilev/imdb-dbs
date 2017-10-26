// This script is to be run after dataImport.sh
// Here, we transform the data to the way we want for the queries

var fs = require('fs');
var async = require('async');
var firstline = require('firstline');


exports.preprocess = function(config) {
// Runs the functions in the array one after the other
  async.waterfall([
    getHeaderData,
    setNulls
  ], function(err, res) {
    if (err)
      console.error('Error in final waterfall callback: ' + err);

    console.log('Result in final callback: ');
    console.log(res);
  });
}


// Return an object with all of the header data from the datasets
function getHeaderData(callback) {
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
        
      console.log('getHeaderData result: ' + headerData);
      callback(null, headerData);
    });
}


function setNulls(headerData, callback) {
  // db.getCollection('titleBasics').updateMany(
  //   { 'endYear': '\\N' }, 
  //   { $set: {'endYear': null} }
  // );
}
