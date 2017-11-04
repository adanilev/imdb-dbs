'use strict';

// In progress
exports.getActorsTopRatedMovies = function() {
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect(process.env.MONGO_DB_URL, function(err, db) {
    var users = db.collection('nameBasics');
    users.find({ nconst: 'nm0000001' }).toArray(function(err, docs) {
      console.log('Found the following records');
      console.log(docs);
    });

    db.close();
  });
};
