'use strict';

/* jshint expr:true */

const
    should = require('chai').should(),
    request = require('supertest'),
    mongoose = require('mongoose'),
    Path = require('path');

/**
 * Globals
 */
var app, User, agent, credentials, user;


before(() => {
    User = mongoose.model('user');
});

/**
 * User routes tests
 */
describe('User CRUD tests', function () {

    before(function (done) {
        app = require(Path.resolve('./server/app'));
        agent = request.agent(app);
        done();
    });

    beforeEach(function (done) {
        // Create user credentials
        credentials = {
            username: 'f7e52fc6-479d-431f-8041-7850ba4c19aa',
            password: 'a1a9975b-a8f2-48b3-9e51-4cbd5de074da'
        };

        // Create a new user
        user = new User({
            username: credentials.username,
            password: credentials.password
        });

        // Save a user to the test db and create new article
        user.save(function (err) {
            should.not.exist(err);
            done();
        });
    });

    it('should be able to login successfully', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }

                should.exist(signinRes.body.token);
                should.exist(signinRes.body.user);

                return done();
            });
    });


    it('should not be able to login with wrong credentials', function (done) {
        credentials.username = 'wrong user';
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(401)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    return done(signinErr);
                }
                return done();
            });
    });


    // jwt.sign({ id: req.user.id }, config.get('jwt.secretOrKey'), { expiresIn: config.get('jwt.expiresIn') });
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4ZDA1ZGU5MTI3OTM5MjM5ZjhiYWNkZSIsImlhdCI6MTQ5MDA1MDUzNywiZXhwIjoxNDkwMDU3NzM3fQ.h0_FJiBAFrdYQWaYESMHa4dLZhv8Igs-tJbQ8pmCDv4


    afterEach(function () {
        return User.remove();
    });
});
