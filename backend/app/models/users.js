var mongoose = require('mongoose');

// define schema for concept model
var userSchema = mongoose.Schema({
    _id			 : String,
    unanswered	 : [],
    //more info possibly added later
});

// expose the model to the app
module.exports = mongoose.model('users', userSchema);