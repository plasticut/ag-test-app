'use strict';

const
    debug = require('debug')('api:routes'),
    express = require('express'),
    router = new express.Router(),
    Path = require('path'),
    utils = require( Path.resolve('./server/utils') );

module.exports = router;

/**
    Load routes from current dir
*/
utils.getGlobbedFiles('api/routes/**/*.routes.js').forEach(route=>{
    debug('Load routes', route);
    require(route)(router);
});