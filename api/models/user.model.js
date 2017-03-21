'use strict';

/**
    User server model
*/

const
    debug = require('debug')('app:models:user'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    crypto = require('crypto');

/**
    User Schema
*/
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        default: '',
        required: true
    },
    salt: {
        type: String
    }
}, {
    timestamps: true
});


/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});


/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'sha1').toString('base64');
};


/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};


const User = mongoose.model('user', UserSchema);

debug('register user model');

module.exports = User;