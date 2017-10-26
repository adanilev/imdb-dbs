#!/bin/bash

IMDB_MONGO_HOME=/Users/adanilev/dev/imdb-dbs

# Stop docker and delete files
docker stop imdb-mongo
rm -r ${IMDB_MONGO_HOME}/data-files/originals-short/*
rm -r ${IMDB_MONGO_HOME}/data-files/mongo/*

# Restart mongo
docker run -d \
  --name imdb-mongo \
  --volume ${IMDB_MONGO_HOME}/data-files/mongo:/data/db \
  --volume ${IMDB_MONGO_HOME}/data-files/originals-short:/data/import \
  --volume ${IMDB_MONGO_HOME}/mongo/scripts:/scripts \
  --rm \
  --publish 127.0.0.1:27017:27017 mongo