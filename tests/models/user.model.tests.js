'use strict';

/* jshint expr:true */


/**
    User model tests
*/


const
    should = require('chai').should(),
    mongoose = require('mongoose'),
    Bluebird = require('bluebird'),

    Schema = mongoose.Schema;


var User, user;


before(() => {
    User = mongoose.model('user');
});


var user1, user2, user3;


describe('User Model Unit Tests:', function () {

    before(function () {
        user1 = {
            username: 'username',
            password: 'M3@n.jsI$Aw3$0m3',
        };
        // user2 is a clone of user1
        user2 = user1;
        user3 = {
            username: 'different_username',
            password: 'Different_Password1!',
        };
    });

    describe('Method Save', function () {
        it('should begin with no users', function (done) {
            User.find({}, function (err, users) {
                (users).should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function (done) {
            var _user1 = new User(user1);

            _user1.save(function (err) {
                should.not.exist(err);
                _user1.remove(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should fail to save an existing user again', function (done) {
            var _user1 = new User(user1);
            var _user2 = new User(user2);

            _user1.save(function () {
                _user2.save(function (err) {
                    should.exist(err);
                    _user1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should confirm that saving user model doesnt change the password', function (done) {
            var _user1 = new User(user1);

            _user1.save(function (err) {
                should.not.exist(err);

                var passwordBefore = _user1.password;
                _user1.save(function (err) {
                    var passwordAfter = _user1.password;
                    passwordBefore.should.equal(passwordAfter);
                    _user1.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should be able to save 2 different users', function (done) {
            var _user1 = new User(user1);
            var _user3 = new User(user3);

            _user1.save(function (err) {
                should.not.exist(err);
                _user3.save(function (err) {
                    should.not.exist(err);
                    _user3.remove(function (err) {
                        should.not.exist(err);
                        _user1.remove(function (err) {
                            should.not.exist(err);
                            done();
                        });
                    });
                });
            });
        });

        it('should not save the password in plain text', function (done) {
            var _user1 = new User(user1);
            var passwordBeforeSave = _user1.password;
            _user1.save(function (err) {
                should.not.exist(err);
                _user1.password.should.not.equal(passwordBeforeSave);
                _user1.remove(function(err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should not save the passphrase in plain text', function (done) {
            var _user1 = new User(user1);
            _user1.password = 'RandomPassword';
            var passwordBeforeSave = _user1.password;
            _user1.save(function (err) {
                should.not.exist(err);
                _user1.password.should.not.equal(passwordBeforeSave);
                _user1.remove(function(err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should validate when the password is undefined', function () {
            var _user1 = new User(user1);
            _user1.password = undefined;

            _user1.validate(function (err) {
                should.not.exist(err);
            });
        });
    });

    after(function (done) {
        User.remove().exec(done);
    });
});