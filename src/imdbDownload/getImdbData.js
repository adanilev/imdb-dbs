var AWS = require('aws-sdk');
var fs = require('fs');

var s3 = new AWS.S3();

var imdbFolder = 'documents/v1/current/';
var outputDirectory =
  process.env.IMDB_DBS_HOME + '/data-files/zipped-originals';

var datasets = [
  'title.basics.tsv.gz',
  'title.akas.tsv.gz',
  'title.crew.tsv.gz',
  'title.episode.tsv.gz',
  'title.principals.tsv.gz',
  'title.ratings.tsv.gz',
  'name.basics.tsv.gz'
];

datasets.forEach(dataset => {
  var params = {
    Bucket: 'imdb-datasets',
    Key: imdbFolder + dataset,
    RequestPayer: 'requester'
  };

  s3.getObject(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      fs.writeFile(outputDirectory + dataset, data.Body, () => {
        console.log('Done writing ' + dataset);
      });
    }
  });
});
