# imdb-dbs

Loading and querying IMDB data using different databases just for kicks.

A work in progress...


## Queries

1. For a given actor, find their 5 most highly rated films
2. Find the top 10 films with more than n votes
3. Given two people, list what movies they appeared in together
4. List all of the cast and crew in a given movie
5. Find the most prolific actor is a given period
6. Find the 5 most prolific actors in a given genre 
7. For a given person (actor or cast), find the 5 people they've worked with the most
8. 6 degrees of Kevin Bacon - given 2 actors, find the shortest link between them


## Install
1. Clone this repo and cd to it
1. Download the IMDB datasets and unzip them into ./data-files/originals


## Mongo

Start the database and import the data. Invoke with -s flag to use truncated datasets to make testing quicker

```bash
./mongo/start.sh
```