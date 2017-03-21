'use strict';

/**
    Local passport strategy
    auth with username and password
*/

const
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),

    User = mongoose.model('user');

module.exports = () => {

    const params = {
        usernameField: 'username',
        passwordField: 'password'
    };

    function verifyFunction(username, password, done) {
        // Retreive user and check password
        User.findOne({ username }, (err, user) => done(err, !!user && user.authenticate(password) && user) );
    }

    const strategy = new LocalStrategy(params, verifyFunction);

    passport.use(strategy);
};