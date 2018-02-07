# imdb-dbs-mongo

Loads the IMDB public dataset into a MongoDB instance and exposes some queries.

## Setup
* Clone this repo
```bash
git clone https://github.com/adanilev/imdb-dbs/tree/master/packages/imdb-dbs-mongo
```

* Install dependencies and build the project
```bash
cd imdb-dbs-mongo
npm install
```

* Create .env file
```bash
cp .env.example .env
```

* Then open it and update the values to taste (like where do you want to store the files)

* Start and build the database
```bash
npm run build
```

* You can now require this module and call any of the queries in src/queries.js
```javascript
const queries = require('imdb-dbs-mongo');

queries.getActorsLatestTenMovies('nm1588970');
queries.getActorsTopRatedMovies('nm1588970');
queries.getTopRatedMoviesWithNVotes(10000);
queries.getCostarredMovies('nm0302368', 'nm0001908');
queries.getCastAndCrew('tt0000439');
queries.getProlificPeriodActor(1900, 1915);
queries.getProlificGenreActors('Action');
queries.getMostFrequentColleagues('nm0000428', 5);
queries.getSixDegreesOf('nm0302368', 'nm0001908');  // soon
```