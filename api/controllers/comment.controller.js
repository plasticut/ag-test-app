'use strict';

/**
    Comment server controller
*/

const
    debug = require('debug')('api:contollers:comment'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('./error.controller'),

    Comment = mongoose.model('comment');


module.exports = {
    findById,

    create,
    read,
    update,
    destroy,
    list,

    level
};


/**
    Comment parameter middleware
*/
function findById(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid comment id' });
    }


    Comment
        .findById(id)
        .exec()
        .then((item) => {
            if (!item) { return res.status(404).send({ message: 'Comment not found' }); }
            req.__comment = item;
            next();
        })
        .catch(next);
}

/**
    Create a comment
*/
function create(req, res, next) {
    const comment = new Comment( req.body );

    comment.userCreator = req.user;

    comment
        .save()
        .then( item => res.status(200).json(item) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );
}

/**
    Show current comment
*/
function read(req, res, next) {
    const comment = req.__comment;

    res.status(200).json(comment);
}

/**
    Update a comment
*/
function update(req, res, next) {
    const comment = _.extend(req.__comment, req.body);

    comment
        .save()
        .then( (item)=>res.json( item ) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );
}

/**
    Delete an comment
*/
function destroy(req, res, next) {
    const comment = req.__comment;

    comment
        .remove()
        .then( (comments)=>res.json( comment ) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );
}

/**
    List of comments
*/
function list(req, res, next) {

    Comment
        .find()
        .exec()
        .then( (items)=>res.json( items ) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );

}


/**
    Level of current comment
*/
function level(req, res, next) {
    const comment = req.__comment;

    comment.level()
        .then( level => res.json({ level: level }) )
        .catch( error => res.status(400).send({ message: errorHandler.getErrorMessage(error) }) );
}
