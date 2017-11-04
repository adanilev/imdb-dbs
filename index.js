"use strict";

require("dotenv").config();
var mongo = require("./src/mongo/queries");

mongo.getActorsTopRatedMovies();
