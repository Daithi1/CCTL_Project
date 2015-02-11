var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
var port = 80;
app.listen(port);

app.get('/', function(req, res){
	res.render('index', {});
});

app.get('/results', function(req, res) {
	res.render('results', {});
});

app.get('/login', function(req, res) {
	res.render('login', {});
});
