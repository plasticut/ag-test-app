'use strict';

/**
 * Initialize passport strategies
 */

const
    passport = require('passport'),
    Path = require('path'),
    config = require('config'),
    mongoose = require('mongoose'),
    utils = require('./utils'),

    User = mongoose.model('user');

module.exports = function() {

    // passport.serializeUser( (user, done)=>done(null, user.id) );

    // passport.deserializeUser( (_id, done) => {

    //     User.findById(_id, '-salt -password')
    //         .then( (user)=>done(null, user) )
    //         .catch(done);

    // });

    // Initialize strategies
    utils.getGlobbedFiles('server/strategies/**/*.js').forEach( strategy => require(strategy)() );
};