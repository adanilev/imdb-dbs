// This script is to be run after dataImport.sh
// Here, we transform the data to the way we want for the queries

var fs = require('fs');
var async = require('async');
var firstline = require('firstline');
var config;

exports.preprocess = function(config_, callback) {
  console.log('Pre-processing data');
  config = config_;
  // Runs the functions in the array one after the other
  async.waterfall(
    [
      getHeaderData,
      setNulls,
      convertToArrays,
      embedRatings,
      embedCast,
      embedAkas,
      embedCrew,
      deleteCollections
    ],
    function(err, res) {
      if (err) console.error('Error in final waterfall callback: ' + err);

      console.log('Done pre-processing data');
      callback();
    }
  );
};

// Return an object with all of the header data from the datasets
function getHeaderData(callback) {
  var headerData = [];

  async.each(
    // Pass the values of this array
    config.datasets,
    // To this function
    function(dataset, cb) {
      firstline(
        process.env.IMDB_DBS_HOME + '/data-files/originals/' + dataset.filename
      )
        .then(headerLine => {
          var hd = {
            collectionName: dataset.collection,
            headers: headerLine.split('\t')
          };
          headerData.push(hd);
          cb();
        })
        .catch(err => {
          console.error('firstline error: ' + err);
        });
    },
    // Then callback after they all completed
    function(err) {
      if (err) console.error('getHeaderData error: ' + err);
      callback(null, headerData);
    }
  );
}

// Replace \\N with null for all blank fields
function setNulls(headerData, callback) {
  console.log('Setting nulls');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    // For each file
    async.eachSeries(
      headerData,
      function(hd, cbk) {
        var collection = db.collection(hd.collectionName);

        // For each header/column
        async.eachSeries(
          hd.headers,
          function(header, cb) {
            var findQuery = {};
            var setStmt = {};
            findQuery[header] = '\\N';
            setStmt[header] = null;

            // Set any \\N value to null
            collection.updateMany(findQuery, { $set: setStmt }, function(
              err,
              res
            ) {
              if (err) {
                cb(err);
              } else {
                cb();
              }
            });
          },
          function(err) {
            if (err) {
              console.error('Error in setNulls: ' + err);
            } else {
              cbk();
            }
          }
        );
      },
      function(err) {
        if (err) {
          console.error('Error in setNulls: ' + err);
        } else {
          console.log('...Done setting null values');
          db.close();
          callback();
        }
      }
    );
  });
}

// There are some comma separated columns, convert them to arrays
function convertToArrays(callback) {
  console.log('Converting fields that contain lists to arrays');

  var toConvert = [
    {
      collection: 'nameBasics',
      fields: ['primaryProfession', 'knownForTitles']
    },
    {
      collection: 'titleAkas',
      fields: ['types', 'attributes']
    },
    {
      collection: 'titleBasics',
      fields: ['genres']
    },
    {
      collection: 'titleCrew',
      fields: ['directors', 'writers']
    },
    {
      collection: 'titlePrincipals',
      fields: ['principalCast']
    }
  ];

  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    // For each collection
    async.eachSeries(
      toConvert,
      function(tc, cbk) {
        // Construct the statements that go in our $addFields aggregation pipeline stage. Looks like:
        //   $addFields: { "knownForTitles": { $split: ["$knownForTitles", ","] } }
        var addStmt = {};
        tc.fields.forEach(function(field) {
          addStmt[field] = { $split: ['$' + field, ','] };
        });

        db
          .collection(tc.collection)
          .aggregate(
            [{ $addFields: addStmt }, { $out: tc.collection }],
            function(err, result) {
              cbk();
            }
          );
      },
      function(err) {
        if (err) {
          callback(err);
        } else {
          console.log('...Done converting to arrays');
          db.close();
          callback();
        }
      }
    );
  });
}

// Embed the ratings in the titleBasics collection
function embedRatings(callback) {
  console.log('Embedding ratings');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    db.collection('titleBasics').aggregate([
      {
        $lookup: {
          from: 'titleRatings',
          localField: 'tconst',
          foreignField: 'tconst',
          as: 'tmpRatings'
        }
      },
      {
        $addFields: {
          ratings: { $arrayElemAt: ['$tmpRatings', 0] }
        }
      },
      {
        $project: {
          tmpRatings: 0,
          'ratings._id': 0,
          'ratings.tconst': 0
        }
      },
      {
        $out: 'titleBasics'
      }
    ],
    function(err, result) {
      console.log('...Done embedding ratings');
      db.close();
      callback();
    });
  });
}

function embedCast(callback) {
  console.log('Embedding cast');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    db.collection('titleBasics').aggregate([
      {
        $lookup: {
          from: 'titlePrincipals',
          localField: 'tconst',
          foreignField: 'tconst',
          as: 'tmpPrincipalCast'
        }
      },
      {
        $addFields: {
          tmpPrincipalCast2: '$tmpPrincipalCast.principalCast'
        }
      },
      {
        $addFields: {
          cast: { $arrayElemAt: ['$tmpPrincipalCast2', 0] }
        }
      },
      {
        $project: {
          tmpPrincipalCast: 0,
          tmpPrincipalCast2: 0
        }
      },
      {
        $out: 'titleBasics'
      }
    ],
    function(err, result) {
      console.log('...Done embedding cast');
      db.close();
      callback();
    });
  });
}

function embedAkas(callback) {
  console.log('Embedding alternative titles');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    db.collection('titleBasics').aggregate([
      {
        $lookup: {
          from: 'titleAkas',
          localField: 'tconst',
          foreignField: 'titleId',
          as: 'tmpAkas'
        }
      },
      {
        $addFields: {
          akas: {
            $map: {
              input: '$tmpAkas',
              as: 'anAka',
              in: { $concat: ['$$anAka.title'] }
            }
          }
        }
      },
      {
        $project: {
          tmpAkas: 0
        }
      },
      {
        $out: 'titleBasics'
      }
    ],
    function(err, result) {
      console.log('...Done embedding alternative titles');
      db.close();
      callback();
    });
  });
}

function embedCrew(callback) {
  console.log('Embedding crew');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    db.collection('titleBasics').aggregate([
      {
        $lookup: {
          from: 'titleCrew',
          localField: 'tconst',
          foreignField: 'tconst',
          as: 'tmpCrew'
        }
      },
      {
        $addFields: {
          tmpCrew2: { $arrayElemAt: ['$tmpCrew', 0] }
        }
      },

      {
        $addFields: {
          directors: {
            $map: {
              input: '$tmpCrew2.directors',
              as: 'director',
              in: { $concat: ['$$director'] }
            }
          }
        }
      },
      {
        $addFields: {
          writers: {
            $map: {
              input: '$tmpCrew2.writers',
              as: 'writer',
              in: { $concat: ['$$writer'] }
            }
          }
        }
      },
      {
        $project: {
          tmpCrew: 0,
          tmpCrew2: 0
        }
      },
      {
        $out: 'titleBasics'
      }
    ],
    function(err, result) {
      console.log('...Done embedding crew');
      db.close();
      callback();
    });
  });
}

function deleteCollections(callback) {
  console.log('Dropping unused collections');
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(config.db_url, function(err, db) {
    var collections = [
      'titleAkas',
      'titleCrew',
      'titleEpisode',
      'titlePrincipals',
      'titleRatings'
    ];
    async.eachSeries(
      collections,
      function(collection, cbk) {
        db.dropCollection(collection);
        cbk();
      },
      function(err) {
        db.close();
        if (err) {
          console.error('Error in deleteCollections');
        } else {
          console.log('...Done dropping collections');
          callback();
        }
      }
    );
  });
}
