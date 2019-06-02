const fs = require('fs');
const s3 = new require('aws-sdk').S3();

const imdbFolder = 'documents/v1/current/';
const outputDirectory =
  process.env.IMDB_DATA_DIR + '/zipped-originals';

const datasets = [
  'title.basics.tsv.gz',
  'title.akas.tsv.gz',
  'title.crew.tsv.gz',
  'title.episode.tsv.gz',
  'title.principals.tsv.gz',
  'title.ratings.tsv.gz',
  'name.basics.tsv.gz'
];

datasets.forEach(dataset => {
  let params = {
    Bucket: 'imdb-datasets',
    Key: imdbFolder + dataset,
    RequestPayer: 'requester'
  };

  s3.getObject(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      fs.writeFile(outputDirectory + dataset, data.Body, () => {
        //
        console.log('Done writing ' + dataset);
      });
    }
  });
});
