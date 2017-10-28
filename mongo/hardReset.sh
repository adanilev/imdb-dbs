#!/bin/bash

# Deletes everything and starts it with short data files

# TODO: allow this to be passed in as param, and check if exists already
IMDB_MONGO_HOME=/Users/adanilev/dev/imdb-dbs

echo "Stopping and destroying everything"
docker stop imdb-mongo
rm -r ${IMDB_MONGO_HOME}/data-files/originals-short/*
rm -r ${IMDB_MONGO_HOME}/data-files/mongo/*

./start.sh -s