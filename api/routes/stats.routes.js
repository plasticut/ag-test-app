'use strict';

const
    stats = require('../controllers/stats.controller');

module.exports = router => {

    router.route('/stats/top-commenters')
        .get(
            stats.topCommenters
        );

};