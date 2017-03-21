'use strict';

/* jshint expr:true */

/**
    Error controller tests
*/


const
    should = require('chai').should(),
    request = require('supertest'),
    mongoose = require('mongoose'),
    Path = require('path');


var errorController, User;


before(() => {
    errorController = require(Path.resolve('./api/controllers/error.controller'));
    User = mongoose.model('user');
});


describe('Error controller tests', function () {

    it('should be able to format uniq validation errors', function (done) {
        const userData = {
            username: 'username',
            password: 'password'
        };

        const user1 = new User(userData);
        const user2 = new User(userData);

        user1.save(function () {

            user2.save(function(error) {
                const message = errorController.getErrorMessage(error);

                (message).should.be.string('Username already exists');

                user1.remove(() => done());
            });
        });

    });


    it('should be able to format unknown errors', function (done) {
        const message = errorController.getErrorMessage({ code: Infinity });

        (message).should.be.string('Something went wrong');
        done();
    });


});
