#!/bin/bash

# TODO: allow IMDB_MONGO_HOME to be passed in or check if it exists?

IMDB_MONGO_HOME=/Users/adanilev/dev/imdb-dbs
DATA_FILES=${IMDB_MONGO_HOME}/data-files/originals

# Use short files if invoked with -s flag
while getopts ":s" opt; do
  case "${opt}" in
    s)
      DATA_FILES=${IMDB_MONGO_HOME}/data-files/originals-short
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

echo "Starting imdb-mongo container"
docker run -d \
  --name imdb-mongo \
  --volume ${IMDB_MONGO_HOME}/data-files/mongo:/data/db \
  --volume ${DATA_FILES}:/data/import \
  --rm \
  --publish 127.0.0.1:27017:27017 mongo

# Run init script if previous command was successful
if [ $? = 0 ]; then
  echo "Running initDb"
  node ${IMDB_MONGO_HOME}/mongo/initDb.js
else
  exit 1
fi

