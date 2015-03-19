var request = require('request');
var childprocess = require('child_process');
var express = require('express');
var apiURL = 'http://localhost:3000';

module.exports = function(app, passport) {

    // Static Content (css/js/fonts)
    app.use('/assets', express.static('assets'));
    app.use('/fonts', express.static('fonts'));    

    // HOME-PAGE
    app.get('/', function(req, res) {
        // render homepage
        res.render('index.ejs', { isLoggedIn : req.isAuthenticated()});
    });

    // LOGIN-PAGE
    app.get('/login', function(req, res) {
        // render login page with any flash-messages
        if(req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('login.ejs', { message: req.flash('loginMessage')}); 
        }
    });

    // handle login forms
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to profile on successful login
        failureRedirect : '/login',  // re-render login page if unsuccessful
        failureFlash : true         // allow flash messages
    }));

    // SIGN-UP
    app.get('/signup', function(req, res) {

        if(req.isAuthenticated()){
            res.redirect('/profile');
        } else {
            // render signup and any flash mesaages
            res.render('signup.ejs', { message: req.flash('signupMessage')});
        }
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
            user : req.user,
        });
    });


    app.get('/survey', isLoggedIn, function(req, res) {
        request.get(apiURL + '/ranges', function(error, response, body){
            console.log(body);
            res.render('survey_choose_range.ejs', {ranges : JSON.parse(body)});
        });
        
    });

    app.get('/survey/:agerange', isLoggedIn, function(req, res) {
        var range = req.params.agerange;
        request.get(apiURL + '/surveyquestion', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('survey.ejs', {conceptpair : JSON.parse(body),
                                          ageRange : range});
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
        res.redirect('/results/overall');
    });

    app.get('/results/:agerange', function(req, res) {
        var range = req.params.agerange;
        request.get(apiURL + '/results/' + range, function(error, response, body) {
            if(error) res.send(error);
            else {
                request.get(apiURL + '/ranges', function(err, resp, bod){
                    res.render('results.ejs', {concepts : JSON.parse(body),
                                            isLoggedIn : req.isAuthenticated(),
                                            ranges : JSON.parse(bod),
                                            range : range});
                });
            }
        });
    });

    app.get('/poop', function(req, res) {
        res.render('results_choose_age.ejs', {isLoggedIn : req.isAuthenticated()});
    });
    
    // handles responses to survey questions
    app.get('/response/:id/:agerange', isLoggedIn, function(req, res) {
        var conceptid = req.params.id;
        var range = req.params.agerange;
        request({ url: apiURL + '/concepts/increment/' + conceptid + '/' + range, method: 'PUT', json: {}}, function(error, response, body) {
            res.redirect('/survey/' + String(range));
        });
    });

    // creates new conceptpairs
    app.get('/manageconcepts', isLoggedIn, function(req, res) {
        request.get(apiURL + '/concepts', function(error, response, body) {
            if(error) res.send(error);
            else {
                res.render('manage.ejs', {concepts : JSON.parse(body)}); 
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
                res.redirect('/manageconcepts');
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
                else res.redirect('/manageconcepts');
            });
        } else {
            res.redirect('/manageconcepts');
        }
    });

    app.post('/addconcept', isLoggedIn, function(req, res) {
        var concept = { name : req.body.title,
                        description : req.body.description};
        if(concept) {
            request.post({url : apiURL + '/concepts', form : {concept : concept}}, function(error, response, body) {
                if(error) res.send(error);
                else res.redirect('/manageconcepts')
            })
        } else {
            res.redirect('/manageconcepts');
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