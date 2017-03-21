'use strict';

const
    comment = require('../controllers/comment.controller'),
    user = require('../controllers/user.controller');

module.exports = router => {

    // Comment collection routes
    router.route('/comments')
        .get(
            comment.list
        )
        .post(
            user.authenticate,
            comment.create
        );

    // Single comment routes
    router.route('/comments/:commentId')
        .get(
            comment.read
        )
        .put(
            user.authenticate,
            comment.update
        )
        .delete(
            user.authenticate,
            comment.destroy
        );

    // Single comment routes
    router.route('/comments/:commentId/level')
        .get(
            comment.level
        );

    // Comment param middleware
    router.param('commentId', comment.findById);
};