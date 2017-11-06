'use strict';

require('dotenv').config();
var mongo = require('./src/mongo/queries');

// query 1
// mongo.getActorsLatestTenMovies('nm0000636');
// query 2
mongo.getActorsTopRatedMovies('nm0000428');
