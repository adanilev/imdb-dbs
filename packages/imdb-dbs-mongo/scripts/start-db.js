'use strict'

require('dotenv-expand')(require('dotenv').config());
const config = require('imdb-dbs-common').config.mongo;
const util = require('imdb-dbs-common').utilityFuncs;
const shell = require('shelljs');

module.exports.start = (cb) => {
  const importDir = util.toBoolean(process.env.USE_TRUNC_FILES) ?
    `${process.env.IMDB_DATA_DIR}/truncated` :
    `${process.env.IMDB_DATA_DIR}/originals`;

  shell.echo('Starting a container called imdb-mongo');
  shell.exec(`docker run -d \
    --name imdb-mongo \
    --volume ${process.env.IMDB_DATA_DIR}/mongo:/data/db \
    --volume ${importDir}:/data/import \
    --rm \
    --publish ${process.env.MONGO_PUBLISH_IP}:${process.env.MONGO_PUBLISH_PORT}:27017 mongo`);

  if (cb) cb();
};