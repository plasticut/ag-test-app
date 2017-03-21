'use strict';


/**
    Comment routes tests
*/

const
    should = require('chai').should(),
    request = require('supertest'),
    Bluebird = require('bluebird'),
    path = require('path'),
    mongoose = require('mongoose');

/**
 * Globals
 */
var app, Comment, User, agent;



before(() => {
    User = mongoose.model('user');
    Comment = mongoose.model('comment');
});


describe('Stats CRUD tests', function () {

    before(function (done) {
        app = require(path.resolve('./server/app'));
        agent = request.agent(app);

        done();
    });

    describe('topCommenters method', function() {

        it('should be able to show results', function (done) {
            /**
                Test tree:

                userA, commmentA1
                    userB, commentB1
                        userB, commentB3
                            userC, commentC2
                    userB, commentB2
                        userC, commentC1
            */

            /**
                expected:

                userB, 3
                userC, 2
                userA, 1

            */

            let userA = new User({
                username: 'userA',
                password: 'ff13907d-250c-4aa2-8126-7b7532e4d704'
            });

            let commentA1 = new Comment({
                content: 'commentA1',
                userCreator: userA._id
            });



            let userB = new User({
                username: 'userB',
                password: 'ff13907d-250c-4aa2-8126-7b7532e4d704'
            });

            let commentB1 = new Comment({
                content: 'commentB1',
                userCreator: userB._id,
                parentComment: commentA1._id
            });

            let commentB2 = new Comment({
                content: 'commentB2',
                userCreator: userB._id,
                parentComment: commentA1._id
            });

            let commentB3 = new Comment({
                content: 'commentB3',
                userCreator: userB._id,
                parentComment: commentB1._id
            });



            let userC = new User({
                username: 'userC',
                password: 'ff13907d-250c-4aa2-8126-7b7532e4d704'
            });

            let commentC1 = new Comment({
                content: 'commentC1',
                userCreator: userC._id,
                parentComment: commentB2._id
            });

            let commentC2 = new Comment({
                content: 'commentC2',
                userCreator: userC._id,
                parentComment: commentB3._id
            });




            Bluebird
                .each(
                    [
                        userA, userB, userC,
                        commentA1,
                        commentB1, commentB2, commentB3,
                        commentC1, commentC2
                    ],
                    item => item.save()
                )
                .then(() => {

                    agent.get('/api/stats/top-commenters')
                        .expect(200)
                        .end((statsErr, statsRes) => {
                            if (statsErr) {
                                return done(statsErr);
                            }

                            const stats = statsRes.body;

                            (stats).should.be.an.instanceof(Array).and.have.lengthOf(3);
                            (stats[0]).should.have.property('commentCount', 3);
                            (stats[1]).should.have.property('commentCount', 2);
                            (stats[2]).should.have.property('commentCount', 1);

                            (stats[0]).should.have.property('username', 'userB');
                            (stats[1]).should.have.property('username', 'userC');
                            (stats[2]).should.have.property('username', 'userA');

                            done();
                        });
                })
                .catch(done);

        });

    });

    afterEach(function () {
        return Promise.all([
            User.remove(),
            Comment.remove()
        ]);
    });

});
