jest.setTimeout(30000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; // Tells mongoose to use Promise implementation
mongoose.connect(keys.mongoURI, { useMongoClient: true });

