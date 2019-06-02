'use strict'

require('dotenv-expand')(require('dotenv').config());
const config = require('imdb-dbs-common').config.mongo;

// Return an array of actor details, sorted by popularity, maxed at 10
exports.getActor = function (actorName) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_URL, function (err, client) {

    client
      .db(config.dbName)
      .collection('movies')
      .find({ cast: actorId })
      .sort({ startYear: 1 })
      .limit(10)
      .toArray(function (err, docs) {
        console.log('Found the following records');
        docs.forEach(movie => {
          console.log(`...${movie.primaryTitle}`);
        });
      });

    client.close();
  });
};