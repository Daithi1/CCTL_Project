var express  = require('express');
var app = express();
var port = process.argv[2];
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('serve-favicon');
var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.urls.users); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// get URL for backend API
app.apiUrl = process.argv[3];

// express setup
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(favicon(__dirname + '/assets/cctl_favicon.ico'));

//use ejs for views
app.set('view engine', 'ejs');

// setup passport
app.use(session({ secret: 'cctlsupersneakysecret' }));
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages stored in sessions
app.use(flash());

// setup routes
require('./app/routes.js')(app, passport);

// launch server
app.listen(port);
console.log('Server listening on port: ' + port);
