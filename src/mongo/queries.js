'use strict';

// Query 1
exports.getActorsLatestTenMovies = function(actorId) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_DB_URL, function(err, db) {
    db
      .collection('movies')
      .find({ cast: actorId })
      .sort({ startYear: 1 })
      .limit(10)
      .toArray(function(err, docs) {
        console.log('Found the following records');
        docs.forEach(movie => {
          console.log(`...${movie.primaryTitle}`);
        });
      });

    db.close();
  });
};

// Query 2
exports.getActorsTopRatedMovies = function(actorId) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_DB_URL, function(err, db) {
    db
      .collection('movies')
      .find({ cast: actorId })
      .sort({ 'ratings.averageRating': -1, 'ratings.numVotes': -1 })
      .limit(10)
      .toArray(function(err, docs) {
        console.log('Found the following records');
        docs.forEach(movie => {
          console.log(`...${movie.primaryTitle}`);
        });
      });

    db.close();
  });
};

// Query 3
exports.getTopRatedMoviesWithNVotes = function(numVotes) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_DB_URL, function(err, db) {
    db
      .collection('movies')
      .find({ 'ratings.numVotes': { $gt: numVotes } })
      .sort({ 'ratings.averageRating': -1 })
      .limit(10)
      .toArray(function(err, docs) {
        console.log('Found the following records');
        docs.forEach(movie => {
          console.log(
            `...numVotes: ${movie.ratings.numVotes} rating: ${movie.ratings
              .averageRating} - ${movie.primaryTitle}`
          );
        });
      });

    db.close();
  });
};

// Query 4
exports.getCostarredMovies = function(actorId1, actorId2) {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_DB_URL, function(err, db) {
    db
      .collection('movies')
      .aggregate([
        { $match: { $and: [{ cast: actorId1 }, { cast: actorId2 }] } }
      ])
      .toArray(function(err, docs) {
        console.log('Found the following records');
        docs.forEach(movie => {
          console.log(`...${movie.primaryTitle}`);
        });
      });

    db.close();
  });
};
