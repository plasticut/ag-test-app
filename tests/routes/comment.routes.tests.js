'use strict';


/**
    Comment routes tests
*/

const
    should = require('chai').should(),
    request = require('supertest'),
    path = require('path'),
    Bluebird = require('bluebird'),
    mongoose = require('mongoose');

/**
 * Globals
 */
var app, Comment, User, agent, credentials, user, comment;


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

describe('Comment CRUD tests', function () {

    before(function (done) {
        app = require(path.resolve('./server/app'));
        agent = request.agent(app);

        done();
    });

    beforeEach(function () {
        // Create user credentials
        credentials = {
            username: 'dc8cd645-ef9e-43ec-ac45-6d6a2172487f',
            password: 'bd9113a5-ccf0-41fb-b3a2-f625f2f4e6f1'
        };

        // Create a new user
        user = new User({
            username: credentials.username,
            password: credentials.password,
        });

        comment = {
            title: 'Comment Title',
            content: 'Comment Content'
        };

        // Save a user to the test db and create new Comment
        return user.save();
    });

    it('should be able to save an comment if logged in', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new Comment
                agent.post('/api/comments')
                    .set('Authorization', `JWT ${signinRes.body.token}`)
                    .send(comment)
                    .expect(200)
                    .end(function (commentSaveErr, commentSaveRes) {
                        if (commentSaveErr) {
                            return done(commentSaveErr);
                        }

                        // Get a list of comments
                        agent.get('/api/comments')
                            .set('Authorization', `JWT ${signinRes.body.token}`)
                            .expect(200)
                            .end(function (commentsGetErr, commentsGetRes) {
                                if (commentsGetErr) {
                                    return done(commentsGetErr);
                                }

                                // Get comments list
                                var comments = commentsGetRes.body;

                                // Set assertions
                                (comments[0].userCreator).should.equal(userId);
                                (comments[0]).should.have.property('content', 'Comment Content');

                                done();
                            });
                    });
            });
    });

    it('should not be able to save an comment if not logged in', function (done) {
        agent.post('/api/comments')
            .send(comment)
            .expect(401)
            .end(function (commentSaveErr, commentSaveRes) {
                done(commentSaveErr);
            });
    });

    it('should not be able to save an comment if no content is provided', function (done) {
        // Invalidate content field
        comment.content = '';

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new comment
                agent.post('/api/comments')
                    .set('Authorization', `JWT ${signinRes.body.token}` )
                    .send(comment)
                    .expect(400)
                    .end(function (commentSaveErr, commentSaveRes) {
                        if (commentSaveErr) {
                            return done(commentSaveErr);
                        }

                        (commentSaveRes.body).should.have.property('message', 'Path `content` is required.');

                        done();
                    });
            });
    });

    it('should be able to update an comment if signed in', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new comment
                agent.post('/api/comments')
                    .set('Authorization', `JWT ${signinRes.body.token}` )
                    .send(comment)
                    .expect(200)
                    .end(function (commentSaveErr, commentSaveRes) {
                        if (commentSaveErr) {
                            return done(commentSaveErr);
                        }

                        const createdComment = commentSaveRes.body;

                        // Update comment title
                        comment.content = 'New content';

                        // Update an existing comment
                        agent.put(`/api/comments/${createdComment._id}`)
                            .set('Authorization', `JWT ${signinRes.body.token}` )
                            .send(comment)
                            .expect(200)
                            .end(function (commentUpdateErr, commentUpdateRes) {
                                if (commentUpdateErr) {
                                    return done(commentUpdateErr);
                                }

                                const updatedComment = commentUpdateRes.body;

                                should.exist(updatedComment._id);
                                should.exist(updatedComment.content);
                                (updatedComment._id).should.equal(createdComment._id);
                                (updatedComment.content).should.have.string('New content');

                                done();
                            });
                    });
            });
    });

    it('should be able to show error while update an comment with empty content', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new comment
                agent.post('/api/comments')
                    .set('Authorization', `JWT ${signinRes.body.token}` )
                    .send(comment)
                    .expect(200)
                    .end(function (commentSaveErr, commentSaveRes) {
                        if (commentSaveErr) {
                            return done(commentSaveErr);
                        }

                        const createdComment = commentSaveRes.body;

                        // Update comment title
                        comment.content = '';

                        // Update an existing comment
                        agent.put(`/api/comments/${createdComment._id}`)
                            .set('Authorization', `JWT ${signinRes.body.token}` )
                            .send(comment)
                            .expect(400)
                            .end(function (commentUpdateErr, commentUpdateRes) {

                                if (commentUpdateErr) {
                                    return done(commentUpdateErr);
                                }

                                (commentUpdateRes.body).should.have.property('message', 'Path `content` is required.');

                                done();
                            });
                    });
            });
    });


    it('should be able to get a list of comments if not signed in', function (done) {
        // Create new comment model instance
        var commentObj = new Comment(comment);

        // Save the comment
        commentObj.save(function () {
            // Request comments
            request(app).get('/api/comments')
                .end(function (commentGetErr, commentGetRes) {
                    if (commentGetErr) {
                        return done(commentGetErr);
                    }

                    const comments = commentGetRes.body;

                    should.exist(comments);
                    (comments).should.be.an.instanceof(Array).and.have.lengthOf(1);

                    done();
                });

        });
    });

    it('should be able to get a single comment if not signed in', function (done) {
        // Create new comment model instance
        var commentObj = new Comment(comment);

        // Save the comment
        commentObj.save(function () {
            request(app).get(`/api/comments/${commentObj._id}`)
                .end(function (commentGetErr, commentGetRes) {
                    if (commentGetErr) {
                        return done(commentGetErr);
                    }

                    const comment = commentGetRes.body;

                    should.exist(comment);
                    (comment).should.be.instanceof(Object).and.have.property('content', comment.content);

                    done();
                });
        });
    });

    it('should return proper error for single comment with an invalid Id, if not signed in', function (done) {
        // test is not a valid mongoose Id
        request(app).get('/api/comments/test')
            .end(function (commentGetErr, commentGetRes) {
                if (commentGetErr) {
                    return done(commentGetErr);
                }

                const comment = commentGetRes.body;

                should.exist(comment);
                (comment).should.to.be.instanceof(Object).and.have.property('message', 'Invalid comment id');

                done();
            });
    });

    it('should return proper error for single comment which doesnt exist, if not signed in', function (done) {
        // This is a valid mongoose Id but a non-existent comment
        request(app).get('/api/comments/559e9cd815f80b4c256a8f41')
            .end(function (commentGetErr, commentGetRes) {
                if (commentGetErr) {
                    return done(commentGetErr);
                }

                const comment = commentGetRes.body;

                should.exist(comment);
                (comment).should.to.be.instanceof(Object).and.have.property('message', 'Comment not found');

                done();
            });
    });

    it('should be able to delete an comment if signed in', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                if (signinErr) {
                    return done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new comment
                agent.post('/api/comments')
                    .set('Authorization', `JWT ${signinRes.body.token}` )
                    .send(comment)
                    .expect(200)
                    .end(function (commentSaveErr, commentSaveRes) {

                        if (commentSaveErr) {
                            return done(commentSaveErr);
                        }

                        const createdComment = commentSaveRes.body;

                        // Delete an existing comment
                        agent.delete(`/api/comments/${createdComment._id}`)
                            .set('Authorization', `JWT ${signinRes.body.token}` )
                            .send(comment)
                            .expect(200)
                            .end(function (commentDeleteErr, commentDeleteRes) {
                                // Handle comment error error
                                if (commentDeleteErr) {
                                    return done(commentDeleteErr);
                                }

                                const deletedComment = commentDeleteRes.body;

                                should.exist(deletedComment);
                                (deletedComment._id).should.be.equal(createdComment._id);

                                done();
                            });
                    });
            });
    });

    it('should not be able to delete an comment if not signed in', function (done) {
        // Set comment user
        comment.user = user;

        // Create new comment model instance
        var commentObj = new Comment(comment);

        // Save the comment
        commentObj.save(function () {
            // Try deleting comment
            agent.delete(`/api/comments/${commentObj._id}`)
                .expect(401)
                .end(function (commentDeleteErr, commentDeleteRes) {
                    if (commentDeleteErr) {
                        return done(commentDeleteErr);
                    }
                    return done();
                });

        });
    });

    it('should not be able to show level of comment if not signed in', function (done) {

        createComments(user)
            .then((comments) => {
                // Try deleting comment
                agent.get(`/api/comments/${comments[3]._id}/level`)
                    .expect(200)
                    .end(function (commentLevelErr, commentLevelRes) {
                        if (commentLevelErr) {
                            return done(commentLevelErr);
                        }
                        (commentLevelRes.body).should.be.an.instanceof(Object).and.have.property('level', 2);
                        return done();
                    });

            })
            .catch(done);
    });

    afterEach(function () {
        return Promise.all([
            User.remove(),
            Comment.remove()
        ]);
    });

});
