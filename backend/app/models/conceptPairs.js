var mongoose = require('mongoose');

// define schema for concept model
var conceptPairSchema = mongoose.Schema({
    _id			 : String,
    c1	         : String,
    c2			 : String,
    //more info possibly added later
});

// expose the model to the app
module.exports = mongoose.model('conceptPairs', conceptPairSchema);