'use strict';

/**
    Initialize app
*/

const
    config = require('config'),
    Promise = require('bluebird'),
    database = require('./database');

database
    .connect()
    .then(() => database.loadModels())
    .then(() => Promise
        .fromCallback(cb => {
            const app = require('./app');
            app.listen(config.get('server.port'), config.get('server.host'), cb);
        })
    )
    .then(() => console.log(`Server listen on http://${config.get('server.host')}:${config.get('server.port')}`))
    .catch(error => {
        console.error('Error starting server', error);
        process.exit(0);
    });