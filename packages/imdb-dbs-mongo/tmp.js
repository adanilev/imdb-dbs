require('dotenv-expand')(require('dotenv').config());
const config = require('../imdb-dbs-common').config.mongo;
const MongoClient = require('mongodb').MongoClient;


MongoClient.connect(process.env.MONGO_URL, function (err, client) {
  if (err) throw new Error(`Error connecting to database: ${err}`);
  console.log("Connected successfully to mongo server");
  const db = client.db(config.dbName);

  db.collection('titleBasics')
    .aggregate([
      { $match: {} },
      { $limit: 1 },
      { $out: 'newCollection' }
    ])
    .hasNext()
    .then((x) => {
      console.log(`in then, received: ${x}`);
      console.log('done with the then')
    })
    .catch((err) => {
      console.log('in err: ' + err);
    });


  // , (err, cursor) => {
  //   if (err) throw new Error(`ERROR IN AGGREGATE: ${err}`);
  //   console.log('in the aggregate callback');

  //   cursor.next((err, result) => {
  //     console.log(result);
  //     console.log('DONE with next');
  //   })



  // cursor.close((err, result) => {
  //   if (err) throw new Error(`ERROR IN CLOSE: ${err}`);
  //   console.log('in the close callback');
  //   console.log(`result: ${result}`);
  // });

  // cursor.toArray(function (err, documents) {
  //   console.log(documents);
  //   console.log('>>>>> DONE IN toArray');
  // });

  // });

  console.log('about to close');
  client.close();
});


