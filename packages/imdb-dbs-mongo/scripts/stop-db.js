'use strict'

require('dotenv').config();
const shell = require('shelljs');

shell.echo('Stopping imdb-mongo container');
shell.exec('docker stop imdb-mongo');