var request = require('request');
var childprocess = require('child_process');

module.exports = function(app, passport) {

    // HOME-PAGE
    app.get('/', function(req, res) {
        // render homepage
        res.render('index.ejs');
    });

    // LOGIN-PAGE
    app.get('/login', function(req, res) {
        // render login page with any flash-messages
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // handle login forms
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to profile on successful login
        failureRedirect : '/login',  // re-render login page if unsuccessful
        failureFlash : true         // allow flash messages
    }));

    // SIGN-UP
    app.get('/signup', function(req, res) {

        // render signup and any flash mesaages
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // handle sign-up form
     app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to profile on successful sign-up
        failureRedirect : '/signup', // rre-render signup page if unsuccessful
        failureFlash : true         // allow flash messages
    }));


    // PROFILE-PAGE (not sure if necessary)
    app.get('/profile', isLoggedIn, function(req, res) {
        // render user's profile page
        res.render('profile.ejs', {
            user : req.user
        });
    });

    app.get('/survey', isLoggedIn, function(req, res) {
        request.get('http://127.0.0.1:3000/conceptpairs', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('survey.ejs', {conceptpairs : JSON.parse(body)});
            }
        });
    });

    // LOGOUT
    app.get('/logout', function(req, res) {
        //logout
        req.logout();
        // redirect to homepage
        res.redirect('/');
    });

    // RESULTS
    app.get('/results', function(req, res) {
        request.get('http://127.0.0.1:3000/concepts', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('results.ejs', {concepts : JSON.parse(body)});
            }
        });
    });
    
    app.get('/response/:concept', isLoggedIn, function(req, res) {
        var concept = req.params.concept;
        var cmd = 'python update_concept_diff.py ' + concept;
        childprocess.exec(cmd, function(error, stdout, stderr) {
            if(error) res.redirect('/');
            else res.redirect('/results');
        });
    });
     
};

// check to see if a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated continue
    if (req.isAuthenticated()) {
        return next();
    }
    // else redirect to homepage
    res.redirect('/login');
}