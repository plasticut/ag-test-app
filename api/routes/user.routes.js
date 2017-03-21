'use strict';

const
    bodyParser = require('body-parser'),
    user = require('../controllers/user.controller');

module.exports = router => {

    // Signin route
    router.route('/auth/signin')
        .post(
            user.signin
        );

};