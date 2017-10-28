// This script is to be run after dataImport.sh
// Here, we transform the data to the way we want for the queries

var fs = require('fs');
var async = require('async');
var firstline = require('firstline');
var config;

exports.preprocess = function (config_, callback) {
  console.log("Pre-processing data");
  config = config_;
  // Runs the functions in the array one after the other
  async.waterfall([
    getHeaderData,
    setNulls,
    convertToArrays
  ], function (err, res) {
    if (err)
      console.error('Error in final waterfall callback: ' + err);

    console.log('Done pre-processing data');
    callback();
  });
}


// Return an object with all of the header data from the datasets
function getHeaderData(callback) {
  var headerData = [];

  async.each(
    // Pass the values of this array
    config.datasets,
    // To this function
    function (dataset, cb) {
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
    function (err) {
      if (err)
        console.error('getHeaderData error: ' + err);
      callback(null, headerData);
    });
}


// Replace \\N with null for all blank fields
function setNulls(headerData, callback) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function (err, db) {
    // For each file
    async.eachSeries(headerData, function (hd, cbk) {
      console.log('...Setting nulls in ' + hd.collectionName);
      var collection = db.collection(hd.collectionName);

      // For each header/column
      async.eachSeries(hd.headers, function (header, cb) {
        var findQuery = {};
        var setStmt = {};
        findQuery[header] = "\\N";
        setStmt[header] = null;

        // Set any \\N value to null
        collection.updateMany(findQuery, { $set: setStmt }, function (err, res) {
          if (err) {
            cb(err);
          } else {
            console.log('......' + res.modifiedCount + ' ' + header + ' records updated');
            cb();
          }
        });

      }, function (err) {
        if (err) {
          console.error('Error in setNulls: ' + err);
        } else {
          cbk();
        }
      });

    }, function (err) {
      if (err) {
        console.error('Error in setNulls: ' + err);
      } else {
        console.log('Done setting null values');
        db.close();
        callback();
      }
    });
  });
}


// There are some comma separated columns, convert them to arrays
function convertToArrays(callback) {
  console.log('Converting fields that contain lists to arrays')

  var toConvert = [
    {
      collection: "nameBasics",
      fields: ['primaryProfession', 'knownForTitles']
    },
    {
      collection: "titleAkas",
      fields: ['types', 'attributes']
    },
    {
      collection: "titleBasics",
      fields: ['genres']
    },
    {
      collection: "titleCrew",
      fields: ['directors', 'writers']
    },
    {
      collection: "titlePrincipals",
      fields: ['principalCast']
    },
  ];

  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function (err, db) {
    // For each collection
    async.eachSeries(toConvert, function (tc, cbk) {
      // Construct the statements that go in our $addFields aggregation pipeline stage. Looks like:
      //   $addFields: { "knownForTitles": { $split: ["$knownForTitles", ","] } } 
      var addStmt = {};
      tc.fields.forEach(function (field) {
        addStmt[field] = { '$split': ['$' + field, ','] };
      });

      db.collection(tc.collection).aggregate([
        { $addFields: addStmt },
        { $out: tc.collection }
      ], function (err, result) {
        console.log('...Converted fields in ' + tc.collection);
        cbk();
      });

    }, function (err) {
      if (err) {
        callback(err);
      } else {
        console.log('Done converting to arrays');
        db.close();
        callback();
      }
    });
  });
}