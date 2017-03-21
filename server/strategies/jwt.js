'use strict';

/**
    JSON web token passport strategy
*/

const
    passport = require('passport'),
    PassportJWT = require('passport-jwt'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    config = require('config'),

    User = mongoose.model('user');


module.exports = () => {

    const params = _.extend({
        jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeader()
    }, config.get('jwt'));

    function verifyFunction(payload, done) {
        // Retreive user from payload
        User.findById(payload.id, (err, user) => done(err, !!user && user) );
    }

    const strategy = new PassportJWT.Strategy(params, verifyFunction);

    passport.use(strategy);

};