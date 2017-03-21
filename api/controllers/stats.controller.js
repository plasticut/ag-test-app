'use strict';

/**
    Comment server controller
*/

const
    debug = require('debug')('api:contollers:stats'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('./error.controller'),

    Comment = mongoose.model('comment');


module.exports = {
    topCommenters
};


/**
    Top commenters
*/
function topCommenters(req, res, next) {
    const user = req.user;

    Comment.aggregate([
            // Group by userCreator
            {
                $group: {
                    _id: '$userCreator',
                    commentCount: { $sum: 1 }
                }
            },
            // Populate users
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            // Remove user sub array
            {
                $unwind: '$user'
            },
            // Select fields
            {
                $project: {
                    _id: 1,
                    username: '$user.username',
                    commentCount: 1
                }
            },
            // Sort desc by comment count
            {
                $sort: {
                    commentCount: -1
                }
            }
        ])
        .then( items => res.json(items) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );
}
