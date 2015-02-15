var mongoose = require('mongoose');

// define schema for concept model
var conceptSchema = mongoose.Schema({
	_id			 : String,
    name         : String,
    difficulty   : Number,
    //more info possibly added later
});

// expose the model to the app
module.exports = mongoose.model('concepts', conceptSchema);