# imdb-dbs

Download IMDB's public data from AWS, import it to different types of databases and query it.

...a work in progress...to help me learn stuff...

## Prerequisites
1. AWS account and credentials (to download the data from IMDB - requester pays for the download)
1. Docker 17.12.0
1. npm 5.6.0
1. node 8.9.0

## Setup
* This is a monorepo, so check out the instructions in the relevant DB package (e.g. ./packages/imdb-dbs-mongo)

## Databases
1. MongoDB - pretty much there
1. neo4j - next up
1. PostgreSQL - one day

## Queries

1. Show the latest 10 movies a given actor has been in
1. For a given actor, find their 5 most highly rated films
1. Find the top rated 10 films with more than n votes
1. Given two people, list what movies they appeared in together
1. List all of the cast and crew in a given movie
1. Find the most prolific actor is a given period
1. Find the 5 most prolific actors in a given genre 
1. For a given person (actor or cast), find the 5 people they've worked with the most
1. 6 degrees of Kevin Bacon - given 2 actors, find the shortest link between them



Information courtesy of
IMDb
(http://www.imdb.com).
Used with permission.