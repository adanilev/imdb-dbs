'use strict'

const config = require('imdb-dbs-common').config.mongo;
const fs = require('fs');
const async = require('async');
const firstline = require('firstline');
const MongoClient = require('mongodb').MongoClient;

// Transform data to the way we want for the queries
exports.preprocess = function (callback) {
  console.log('Pre-processing data');
  // Run the functions in this array one after the other
  // TODO: create the DB connection/client up here so all the funcs below don't have to create anew
  async.waterfall(
    [
      createMongoClient,
      getFieldData,
      setNulls,
      convertToArrays,
      embedRatings,
      embedCast,
      embedAkas,
      embedCrew,
      deleteCollections,
      renameCollections
    ],
    function (err, client) {
      if (err) console.error('Error in final waterfall callback: ' + err);

      client.close();
      console.log('Done pre-processing data');
      callback();
    }
  );
};

// Create a client that will be used by the rest of the preprocess functions
function createMongoClient(callback) {
  MongoClient.connect(process.env.MONGO_URL, function (err, client) {
    if (err) throw new Error(`Error connecting to database: ${err}`);

    console.log("Connected successfully to mongo server");
    callback(null, client);
  });
}

// Return an array with all of the collection names a list of their fields
// [ { collectionName: 'titleBasics', headers: [ 'tconst', 'titleType' ] } ]
function getFieldData(client, callback) {
  var fieldData = [];

  async.each(
    // Pass the values of this array
    config.datasets,
    // To this function
    function (dataset, cb) {
      // read only the first line from the file
      firstline(process.env.IMDB_DATA_DIR + '/originals/' + dataset.filename)
        .then(headerLine => {
          var collectionFieldData = {
            collectionName: dataset.collection,
            fields: headerLine.split('\t')
          };
          fieldData.push(collectionFieldData);
          cb();
        })
        .catch(err => {
          console.error('firstline error: ' + err);
        });
    },
    // Then callback after they all completed
    function (err) {
      if (err) console.error('getFieldData error: ' + err);
      callback(null, client, fieldData);
    }
  );
}

// Replace \\N with null for all blank fields
function setNulls(client, fieldData, callback) {
  console.log('Setting nulls');

  async.eachSeries(
    fieldData,
    function (collectionFieldData, cbk) {
      let collection = client.db(config.dbName).collection(collectionFieldData.collectionName);

      // For each field/column
      async.eachSeries(
        collectionFieldData.fields,
        function (field, cb) {
          var findQuery = {};
          var setStmt = {};
          findQuery[field] = '\\N';
          setStmt[field] = null;

          // Set any \\N value to null
          collection.updateMany(findQuery, { $set: setStmt }, function (err, res) {
            if (err) {
              cb(err);
            } else {
              cb();
            }
          });
        },
        function (err) {
          if (err) {
            console.error('Error in setNulls: ' + err);
          } else {
            cbk();
          }
        }
      );
    },
    function (err) {
      if (err) {
        console.error('Error in setNulls: ' + err);
      } else {
        console.log('...Done setting null values');
        callback(null, client);
      }
    }
  );
}

// There are some comma separated columns, convert them to arrays
function convertToArrays(client, callback) {
  console.log('Converting fields that contain lists into arrays');
  const db = client.db(config.dbName);

  const toConvert = [
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

  // For each collection
  async.eachSeries(
    toConvert,
    function (tc, cbk) {
      // Construct the statements that go in our $addFields aggregation pipeline stage. Looks like:
      //   $addFields: { "knownForTitles": { $split: ["$knownForTitles", ","] } }
      let addStmt = {};
      tc.fields.forEach(function (field) {
        addStmt[field] = { $split: ['$' + field, ','] };
      });

      db.collection(tc.collection)
        .aggregate([{ $addFields: addStmt }, { $out: tc.collection }])
        .next((err, result) => {
          if (err) throw new Error(err);
          cbk();
        });
    },
    function (err) {
      if (err) {
        console.error('ERROR in convertToArrays: ');
        callback(err);
      } else {
        console.log('...Done converting to arrays');
        callback(null, client);
      }
    }
  );
}

// Embed the ratings in the titleBasics collection
function embedRatings(client, callback) {
  console.log('Embedding ratings');
  const db = client.db(config.dbName);

  db.collection('titleBasics')
    .aggregate([
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
    ])
    .next((err, result) => {
      console.log('...Done embedding ratings');
      callback(null, client);
    })
}

function embedCast(client, callback) {
  console.log('Embedding cast');
  const db = client.db(config.dbName);

  db.collection('titleBasics')
    .aggregate([
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
    ])
    .next((err, result) => {
      console.log('...Done embedding cast');
      callback(null, client);
    });
}

function embedAkas(client, callback) {
  console.log('Embedding alternative titles');
  const db = client.db(config.dbName);

  db.collection('titleBasics')
    .aggregate([
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
    ])
    .next((err, result) => {
      console.log('...Done embedding alternative titles');
      callback(null, client);
    });
}

function embedCrew(client, callback) {
  console.log('Embedding crew');
  const db = client.db(config.dbName);

  db.collection('titleBasics')
    .aggregate([
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
    ])
    .next((err, result) => {
      console.log('...Done embedding crew');
      callback(null, client);
    });
}

function deleteCollections(client, callback) {
  console.log('Dropping unused collections');
  const db = client.db(config.dbName);

  var collections = [
    'titleAkas',
    'titleCrew',
    'titleEpisode',
    'titlePrincipals',
    'titleRatings'
  ];

  async.eachSeries(
    collections,
    function (collection, cbk) {
      db.dropCollection(collection, function (err, cb) {
        if (err) {
          console.error('Error dropping collection');
        } else {
          cbk();
        }
      });
    },
    function (err) {
      if (err) {
        console.error('Error in deleteCollections');
      } else {
        console.log('...Done dropping collections');
        callback(null, client);
      }
    }
  );
}

function renameCollections(client, callback) {
  console.log('Renaming collections');
  const db = client.db(config.dbName);

  var collections = [
    { oldName: 'nameBasics', newName: 'actors' },
    { oldName: 'titleBasics', newName: 'movies' }
  ];

  async.eachSeries(
    collections,
    function (collection, cbk) {
      db.collection(collection.oldName)
        .rename(collection.newName, function (err) {
          if (err) {
            console.error('Error in rename collections ' + err);
          } else {
            cbk();
          }
        });
    },
    function (err) {
      if (err) {
        console.error('Error in renameCollections');
      } else {
        console.log('...Done renaming collections');
        callback(null, client);
      }
    }
  );
}
