'use strict'

require('dotenv-expand')(require('dotenv').config());
const shell = require('shelljs');

shell.echo('Stopping and removing imdb-mongo container');
shell.exec('docker rm -f imdb-mongo');
shell.echo('Deleting truncated data files');
shell.rm('-r', `${process.env.IMDB_DATA_DIR}/truncated/*`);
shell.echo('Deleting MongoDB files');
shell.rm('-r', `${process.env.IMDB_DATA_DIR}/mongo/*`);