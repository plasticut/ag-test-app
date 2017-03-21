'use strict';

/**
    Configure express
*/

const
    debug = require('debug')('server:app'),

    express = require('express'),
    compression = require('compression'),
    helmet = require('helmet'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    config = require('config'),
    _ = require('lodash'),
    passport = require('passport'),
    app = express(),

    utils = require('./utils');


/**
    Exports express application
*/
module.exports = app;


app.use(compression());

/* istanbul ignore if  */
if ('development' === config.util.getEnv('NODE_ENV')) {
    app.use(logger('dev'));
}

app.use(helmet({
    frameguard: false
}));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', require('../api/routes'));

require('./passport')();
