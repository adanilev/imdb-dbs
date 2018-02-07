const utility = require('./src/utility');
const mongoConfig = require('./config/mongo');

module.exports.config = {
  mongo: mongoConfig
};

module.exports.utilityFuncs = utility.utilityFuncs;