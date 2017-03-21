'use strict';

const database = require('../server/database.js');

before(() => {

    return database.connect()
        .then(() => database.loadModels());

});

after(() => {

    return database.disconnect();

});