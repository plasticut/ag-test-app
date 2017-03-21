'use strict';

/* jshint expr:true */


/**
    Comment model tests
*/


const
    should = require('chai').should(),
    mongoose = require('mongoose'),
    Bluebird = require('bluebird'),


    Schema = mongoose.Schema;


var User, Comment, user;


before(() => {
    User = mongoose.model('user');
    Comment = mongoose.model('comment');
});


function createComments(user) {

    let commentA = new Comment({ userCreator: user, content: 'A' });
    let commentB = new Comment({ userCreator: user, content: 'B', parentComment: commentA._id });
    let commentC = new Comment({ userCreator: user, content: 'C', parentComment: commentA._id });
    let commentD = new Comment({ userCreator: user, content: 'D', parentComment: commentC._id });

    return Bluebird
        .each(
            [commentA, commentB, commentC, commentD],
            comment => comment.save()
        );
}

describe('Comment Model Unit Tests:', function () {

    beforeEach(function (done) {

        user = new User({
            username: 'test user',
            password: '1a9da520-b942-4160-8742-f0005646cd96'
        });

        user.save(done);

    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            let comment = new Comment({
                content: 'Test content',
                userCreator: user
            });

            comment.save( err => {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without content', function (done) {
            let comment = new Comment({
                content: '',
                userCreator: user
            });

            comment.save( err => {
                should.exist(err);
                done();
            });
        });
    });

    describe('Method ancestors', function () {
        it('should be able to show ancestor comments', function (done) {

            createComments(user)
                .then( res => res.pop().ancestors() )
                .then( res => {
                    (res.length).should.be.equal(2);
                    (res[0].content).should.be.string('A');
                    (res[1].content).should.be.string('C');
                    done();
                })
                .catch(done);
        });

    });

    describe('Method level', function () {
        it('should be able to show comment level', function (done) {

            createComments(user)
                .then( res => Bluebird.map(res, item => item.level() ) )
                .then( res => {
                    (res[0]).should.be.equal(0);
                    (res[1]).should.be.equal(1);
                    (res[2]).should.be.equal(1);
                    (res[3]).should.be.equal(2);
                    done();
                })
                .catch(done);
        });

    });

    afterEach(() => Promise
        .all([
            Comment.remove(),
            User.remove()
        ])
    );
});
