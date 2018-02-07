'use strict';

require('dotenv-expand')(require('dotenv').config());

module.exports = require('./src/queries');

// How to call:

// const queries = require('imdb-dbs-mongo');

// queries.getActorsLatestTenMovies('nm1588970');
// queries.getActorsTopRatedMovies('nm1588970');
// queries.getTopRatedMoviesWithNVotes(10000);
// queries.getCostarredMovies('nm0302368', 'nm0001908');
// queries.getCastAndCrew('tt0000439');
// queries.getProlificPeriodActor(1900, 1915);
// queries.getProlificGenreActors('Action');
// queries.getMostFrequentColleagues('nm0000428', 5);