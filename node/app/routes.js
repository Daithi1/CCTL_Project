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

    // LOGOUT
    app.get('/logout', function(req, res) {
        //logout
        req.logout();
        // redirect to homepage
        res.redirect('/');
    });

    // RESULTS
    app.get('/results', function(req, res) {
        // render results page
        res.render('results.ejs', {});
    });
   
     
};

// check to see if a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated continue
    if (req.isAuthenticated()) {
        return next();
    }
    // else redirect to homepage
    res.redirect('/');
}