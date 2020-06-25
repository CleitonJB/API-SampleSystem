const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodeapi', { useMongoClient: true });

mongoose.Promise = global.Promise;

module.exports = mongoose;