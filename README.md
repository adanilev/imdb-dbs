# imdb-dbs

Loading and querying IMDB data using different databases just for kicks.

A work in progress...


## Queries

1. Show the latest 10 movies a given actor has been in
1. For a given actor, find their 5 most highly rated films
1. Find the top 10 films with more than n votes
1. Given two people, list what movies they appeared in together
1. List all of the cast and crew in a given movie
1. Find the most prolific actor is a given period
1. Find the 5 most prolific actors in a given genre 
1. For a given person (actor or cast), find the 5 people they've worked with the most
1. 6 degrees of Kevin Bacon - given 2 actors, find the shortest link between them


## Pre-requisites
* Docker
* npm
* Node
* An AWS account and keys **OR** a copy of zipped IMDB datasets


## Install
1. Clone this repo and cd to it
1. Download the IMDB datasets and unzip them into ./data-files/originals


## Mongo

Start the database and import the data. Invoke with -s flag to use truncated datasets to make testing quicker

```bash
./mongo/start.sh
```

### Schema

Movies {
  _id
  tconst
  titleAkas[]
  titleType
  primaryTitle
  originalTitle
  isAdult
  startYear
  endYear
  runtimeMinutes
  principleActors[]
  genres[]
  rating {
    avgRating
    numVotes
  }
}


Actors {
  _id
  nconst
  primaryName
  birthYear
  deathYear
  primaryProfession
  knownForTitles [refs to Movies.tconst]
  
}


Information courtesy of
IMDb
(http://www.imdb.com).
Used with permission.