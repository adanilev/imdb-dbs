#!/bin/bash

mongoimport --db imdb --collection titleAkas --type tsv --headerline --file /data/import/title.akas.tsv

mongoimport --db imdb --collection titleBasics --type tsv --headerline --file /data/import/title.basics.tsv

mongoimport --db imdb --collection titleCrew --type tsv --headerline --file /data/import/title.crew.tsv

mongoimport --db imdb --collection titleEpisode --type tsv --headerline --file /data/import/title.episode.tsv

mongoimport --db imdb --collection titlePrincipals --type tsv --headerline --file /data/import/title.principals.tsv

mongoimport --db imdb --collection titleRatings --type tsv --headerline --file /data/import/title.ratings.tsv

mongoimport --db imdb --collection nameBasics --type tsv --headerline --file /data/import/name.basics.tsv