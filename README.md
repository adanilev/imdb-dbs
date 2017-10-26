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


## Mongo

### Start docker:

```bash
IMDB_MONGO_HOME=/Users/adanilev/dev/imdb-dbs && \
docker run -d \
  --name imdb-mongo \
  --volume ${IMDB_MONGO_HOME}/data-files/mongo:/data/db \
  --volume ${IMDB_MONGO_HOME}/data-files/originals-short:/data/import \
  --volume ${IMDB_MONGO_HOME}/mongo/scripts:/scripts \
  --rm \
  --publish 127.0.0.1:27017:27017 mongo
```

### Run the import script
```bash
docker exec -it imdb-mongo bash
./scripts/dataImport.sh
```