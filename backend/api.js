// middleware
var express = require("express");
var mongoose = require('mongoose');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var application_root = __dirname;
var port = process.argv[2];

var dbConfig = require('./config/database.js');
mongoose.connect(dbConfig.urls.concepts);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

// setup routes
require('./app/routes.js')(app);

// Launch server
app.listen(port);
console.log('API listening on port: ' + port);