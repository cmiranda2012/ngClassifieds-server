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

    //create classifieds & returns classified
    app.post('/api/classifieds', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            Classified.create({
                name: `${decoded.firstName} ${decoded.lastName}`,
                phone: decoded.phone,
                email: decoded.email,
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                image: req.body.image,
                category: req.body.category,
                createdAt: new Date()
            }, function(err, classified) {

                if (err) {
                    if (err.name === 'ValidationError') {
                        return res.status(422).send(err);
                    }

                    return res.status(500).send(err);
                }

                res.json(classified);
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized.'
            });
        }
    });

    //update classified
    app.put('/api/classifieds/:id', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            const update = {
                name: `${decoded.firstName} ${decoded.lastName}`,
                phone: decoded.phone,
                email: decoded.email,
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                image: req.body.image,
                category: req.body.category,
                updatedAt: new Date()
            }

            Classified.findByIdAndUpdate(req.params.id, update, function(err, classified) {

                if (err) {
                    if (err.name === 'CastError' || err.name === 'ValidationError') {
                        return res.status(422).send(err);
                    }

                    return res.status(500).send(err);
                }

                if (!classified) {
                    return res.status(404).json({
                        success: false,
                        msg: 'Classified not found.'
                    });
                }
                console.log('classified', classified);

                res.json(classified);
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized.'
            });
        }
    });

    //delete classified
    app.delete('/api/classifieds/:id', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {

            Classified.findByIdAndRemove(req.params.id, function(err, classified) {

                if (err) {
                    return res.send(err);
                }

                if (!classified) {
                    return res.status(404).json({
                        success: false,
                        msg: 'Classified not found.'
                    });
                }

                Classified.find(function(err, classifieds) {

                    if (err) {
                        return res.send(err);
                    }

                    res.json(classifieds);
                });
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized.'
            });
        }
    });

    // ------------------------User Routes-------------------------- 

    //user register
    app.post('/api/register', function(req, res) {

        if (!req.body.firstName || !req.body.lastName || !req.body.phone || !req.body.city || !req.body.state || !req.body.email || !req.body.password) {
            return res.status(400).send({
                success: false,
                msg: 'All fields are required.'
            });
        } else {
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                city: req.body.city,
                state: req.body.state,
                email: req.body.email,
                password: req.body.password
            });

            newUser.save(function(err) {

                console.log('err', err);

                if (err) {
                    return res.status(409).json({
                        success: false,
                        msg: 'Email already exist.',
                        err: err
                    });
                }

                res.status(200).json({
                    success: true,
                    msg: 'Registration successful.'
                });
            });
        }

    });

    //user login
    app.post('/api/login', function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {
            return res.json({
                success: true,
                msg: 'Already logged in.',
                token: `JWT ${token}`
            });
        }

        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                msg: 'Email and password are required.'
            });
        } else {
            User.findOne({
                email: req.body.email
            }, function(err, user) {

                if (err) {
                    return res.status(500).end(err);
                }

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        msg: `User ${req.body.email} not found`
                    });
                } else {
                    user.matchPassword(req.body.password, function(err, isMatch) {
                        if (!err && isMatch) {
                            const token = jwt.encode(user, config.secret);

                            return res.json({
                                success: true,
                                msg: 'Login successful',
                                token: `JWT ${token}`
                            });
                        } else {
                            return res.status(401).json({
                                success: false,
                                msg: 'Password is incorrect.'
                            });
                        }
                    });
                }
            });
        }
    });

    //user account
    app.get('/api/account', passport.authenticate('jwt', {
        session: false
    }), function(req, res) {

        var token = ExtractJwt.fromAuthHeader()(req);

        if (token) {
            var decoded = jwt.decode(token, config.secret);

            User.findOne({
                email: decoded.email
            }, function(err, user) {

                if (err) {
                    return res.send(err);
                }

                if (!user) {
                    return res.status(403).json({
                        success: false,
                        msg: 'Authentication failed. User not found.'
                    });
                } else {
                    return res.json(user);
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized.'
            });
        }
    });
};