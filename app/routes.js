'use strict';

const Classified = require('./models/classified');
const User = require('./models/user');
const passport = require('../config/passport')
const jwt = require('jwt-simple');
const config = require('../config/db');
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function(app) {

    // ---------------------Classified Routes---------------------
    //get all classifieds
    app.get('/api/classifieds', function(req, res) {

        Classified.find(function(err, classifieds) {

            if (err) {
                return res.send(err)
            }

            res.json(classifieds);
        });
    });

    //get all classifieds per user
    app.get('/api/myclassifieds', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Classified.find({
                email: decoded.email
            }, function(err, classifieds) {

                if (err) {
                    return res.send(err)
                }

                res.json(classifieds);
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized.'
            });
        }
    });

    //create classifieds & returns all classifieds
    app.post('/api/classifieds', function(req, res) {

        Classified.create({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image
        }, function(err, classified) {

            if (err) {
                return res.send(err);
            }

            Classified.find(function(err, classifieds) {

                if (err) {
                    return res.send(err);
                }

                res.json(classifieds);
            });
        });
    });

    //update classified
    app.put('/api/classifieds/:id', function(req, res) {

        const query = {
            _id: req.params.id
        }

        const update = {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image
        }

        Classified.findOneAndUpdate(query, update, function(err, classified) {

            if (err) {
                return res.send(err);
            }

            res.json(classified);
        });
    });

    //delete classified
    app.delete('/api/classifieds/:id', function(req, res) {

        Classified.remove({
            _id: req.params.id
        }, function(err, classified) {

            if (err) {
                return res.send(err);
            }

            res.json({
                success: true,
                msg: 'Classified deleted.'
            });
        })
    });

    // ------------------------User Routes-------------------------- 

    //sign up
    app.post('/api/signup', function(req, res) {

        if (!req.body.name || !req.body.password) {
            res.json({
                success: false,
                msg: 'Username and password are required.'
            });
        } else {

            const newUser = new User({
                name: req.body.name,
                password: req.body.password
            });

            newUser.save(function(err) {

                if (err) {
                    return res.json({
                        success: false,
                        msg: 'Username already exists.'
                    });
                }

                res.json({
                    success: true,
                    msg: 'User created.'
                });
            });
        }

    });

    //authentication
    app.post('/api/authenticate', function(req, res) {

        User.findOne({
            name: req.body.name
        }, function(err, user) {

            if (err) {
                throw err;
            }

            if (!user) {
                res.send({
                    success: false,
                    msg: 'User not found.'
                });
            } else {
                user.matchPassword(req.body.password, function(err, isMatch) {
                    if (isMatch && !err) {
                        const token = jwt.encode(user, config.secret);
                        res.json({
                            success: true,
                            token: `JWT ${token}`
                        });
                    } else {
                        res.send({
                            success: false,
                            msg: 'Wrong password.'
                        });
                    }
                });
            }
        });
    });

    //profile
    app.get('/api/', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = getToken(req.headers);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            User.findOne({
                name: decoded.name
            }, function(err, user) {

                if (err) {
                    throw err;
                }

                if (!user) {
                    return res.status(403).send({
                        success: false,
                        msg: 'Authentication failed. User not found.'
                    });
                } else {
                    res.json({
                        success: true,
                        msg: `User found ${user.name}`
                    });
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                msg: 'No token found.'
            });
        }
        
    });

};