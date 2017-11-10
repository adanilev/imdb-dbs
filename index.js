'use strict';

require('dotenv').config();
var mongo = require('./src/mongo/queries');

// query 1
// mongo.getActorsLatestTenMovies('nm0000636');

// query 2
// mongo.getActorsTopRatedMovies('nm0000428');

// query 3
// mongo.getTopRatedMoviesWithNVotes(1000);

// query 4
// mongo.getCostarredMovies('nm0000428', 'nm0567363');

// query 5
// mongo.getCastAndCrew('tt0000627');

// query 6
// mongo.getProlificPeriodActor(1900, 1915);

// query 7
// mongo.getProlificGenreActors('Short');

// query 8
mongo.getMostFrequentColleagues('nm0567363', 5);
