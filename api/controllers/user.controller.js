'use strict';

/**
    User server controller
*/

const
    debug = require('debug')('api:contollers:comment'),
    _ = require('lodash'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    config = require('config'),
    mongoose = require('mongoose'),

    User = mongoose.model('user');


module.exports = {
    signin: [
        passport.authenticate('local', { session: false }),
        createToken,
        sendToken
    ],

    authenticate:  passport.authenticate('jwt', { session: false })
};


/**
    Generate JWT token with user.id payload
*/
function createToken(req, res, next) {
    req.token = jwt.sign({ id: req.user.id }, config.get('jwt.secretOrKey'), { expiresIn: config.get('jwt.expiresIn') });
    next();
}

/**
    Send jwt token and user
*/
function sendToken(req, res) {
    res.status(200).json({
        user: _.omit(req.user.toJSON(), ['password', 'salt']),
        token: req.token
    });
}
