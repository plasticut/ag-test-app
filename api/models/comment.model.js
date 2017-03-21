'use strict';

/**
    Comment server model
    uses nested set pattern http://getinfo.ru/article610.html
*/

const
    debug = require('debug')('api:models:comment'),
    mongoose = require('mongoose');

/**
    Comment schema
*/
const CommentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true,
        trim: true
    },

    parentComment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    },

    userCreator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    userEditor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    // Left nested set key
    nsLeft: {
        type: Number,
        min: 0,
        default: 1
    },

    // Right nested set key
    nsRight: {
        type: Number,
        min: 0,
        default: 2
    }

}, {
    timestamps: true
});

/**
    Setup indexes
*/
CommentSchema.index({ nsLeft: true, nsRight: true });
CommentSchema.index({ parentComment: true });

/**
    Hook a pre save method to handle nested set fields
*/
CommentSchema.pre('save', function(next) {
    var self = this;

    if (!this.parentComment) {
        debug('parentComment not set');
        return next();
    }

    this.constructor.findById(this.parentComment)
        .then((parentComment)=>{
            return this.constructor
                .find({ parentComment: this.parentComment, _id: { $ne: this._id } })
                .then((siblingComments) => {

                    let nsRightMax = Math.max(...siblingComments.map(el=>el.nsRight));


                    if (!siblingComments.length) {
                        nsRightMax = parentComment.nsLeft;
                    }

                    return Promise.all([
                        this.constructor
                            .update(
                                { nsLeft: { $gt: nsRightMax } },
                                { $inc: { nsLeft: 2} },
                                { multi: true }
                            ),
                        this.constructor
                            .update(
                                { nsRight: { $gt: nsRightMax } },
                                { $inc: { nsRight: 2 }},
                                { multi: true }
                            )
                        ])
                        .then(()=>{
                            this.nsLeft = nsRightMax+1;
                            this.nsRight = nsRightMax+2;
                        });
                });
        })
        .then( ()=>next() )
        .catch( next );

});

/* CommentSchema.pre('save', ()=>{}) */

/**
    Find current node ancestors
*/
CommentSchema.method('ancestors', function(callback) {
    const query = {
        nsLeft : { $lt: this.nsLeft },
        nsRight: { $gt: this.nsRight }
    };
    return this.constructor.find(query, callback);
});


/**
    Get current node level
*/
CommentSchema.method('level', function(callback) {
    const query = {
        nsLeft : { $lt: this.nsLeft },
        nsRight: { $gt: this.nsRight }
    };
    return this.constructor.count(query, callback);
});


const Comment = mongoose.model('comment', CommentSchema);

debug('register comment model');

module.exports = Comment;