var LocalStrategy   = require('passport-local').Strategy;
var User = require('../app/models/users');

module.exports = function(passport) {

    // serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    
    // handle local signup
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        process.nextTick(function() {

            // attempt to find a user with that email
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                    return done(err);

                // if user with that email exists:
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // create new user
                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);
                    // save ew user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });    

        });

    }));
    // handle local login
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        // attempt to find a user with the given email
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err) {
                return done(err);
            }
            // if no such user exists:
            else if (!user){
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the password is wrong:
            else if (!user.validPassword(password)){
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }
            // else successful login
            else {
                return done(null, user);
            }
        });

    }));

};