var request = require('request');
var childprocess = require('child_process');
var apiURL = 'http://localhost:3000';

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
        request.get(apiURL + '/conceptpairs/' + req.user.id, function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('survey.ejs', {conceptpair : JSON.parse(body)});
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
        request.get(apiURL + '/concepts', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('results.ejs', {concepts : JSON.parse(body)});
            }
        });
    });
    
    // handles responses to survey questions
    app.get('/response/:concept', isLoggedIn, function(req, res) {
        var concept = req.params.concept;
        var cmd = 'python update_concept_diff.py ' + concept;
        childprocess.exec(cmd, function(error, stdout, stderr) {
            if(error) res.redirect('/');
            else res.redirect('/survey');
        });
    });

    // creates new conceptpairs
    app.get('/manageconceptpairs', isLoggedIn, function(req, res) {
        request.get(apiURL + '/conceptpairs', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('manage.ejs', {conceptpairs : JSON.parse(body)}); 
            }
        });
    });

    // handles deleting of concept pairs from manage screen
    app.get('/deletepair/:c1/:c2', isLoggedIn, function(req, res) {
        var c1 = req.params.c1;
        var c2 = req.params.c2;
        request.del(apiURL + '/conceptpairs/'+c1+'/'+c2, function(error, response, body) {
            if(error) res.send(error);
            else {
                res.redirect('/manageconceptpairs');
            }
        });
    });

    // handles creation of new concept pairs from manage screen
    app.post('/addpair', isLoggedIn, function(req, res) {
        var c1 = req.body.c1;
        var c2 = req.body.c2;
        if(c1 && c2) {
            request.post({url : apiURL + '/conceptpairs/', form: {c1 : c1, c2 : c2}}, function(error, response, body){
                if(error) res.send(error);
                else res.redirect('manageconceptpairs');
            });
        } else {
            res.redirect('/manageconceptpairs');
        }
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