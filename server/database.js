'use strict';

const
    debug = require('debug')('server:database'),
    config = require('config'),
    chalk = require('chalk'),
    path = require('path'),
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    utils = require('./utils');


module.exports ={
    loadModels,
    connect,
    disconnect
};


/**
    Set bluebird as mongoose promise
*/
mongoose.Promise = Promise;


/**
    Load mongoose models
*/
function loadModels() {
    const models = utils.getGlobbedFiles('api/models/*.model.js');
    models.forEach(path=>require(path));

    debug('Models loaded', models);

    return Promise.resolve();
}


/**
    Connect to database
*/
function connect() {

    mongoose.set('debug', config.get('db.debug'));
    const uri = `mongodb://${config.get('db.host')}:${config.get('db.port')}/${config.get('db.database')}`;
    debug(`Connecting to ${uri}`);
    return Promise.fromCallback( cb => mongoose.connect(uri, config.get('db.options'), cb) )
        .then((db)=>{
            debug('Db connected');
            return db;
        });

}

/**
    Disconnect from database
*/
function disconnect() {

    return Promise
        .fromCallback( cb => mongoose.disconnect(cb) )
        .then( () => debug('Db disconnected') );

}
