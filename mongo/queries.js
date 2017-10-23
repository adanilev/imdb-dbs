'use strict'

// In progress
exports.getActorsTopRatedMovies = function() {

  var MongoClient = require('mongodb').MongoClient;

  var url = 'mongodb://localhost:27017/imdb';

  MongoClient.connect(url, function(err, db) {

    var users = db.collection('nameBasics');
    users.find({'nconst': 'nm0000001'}).toArray(function(err, docs) {
      console.log("Found the following records");
      console.log(docs);
    }); 

    db.close();
  });

};