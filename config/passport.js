const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../app/models/user');
const config = require('../config/db');

const opts = {
    secretOrKey: config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

passport.use(new JwtStrategy(opts, function(jwt_payload, cb) {
    User.findOne({
        id: jwt_payload.id
    }, function(err, user) {

        if (err) {
            return cb(err, false);
        }

        if (user) {
            cb(null, user);
        } else {
            cb(null, false);
        }
    });

}));

module.exports = passport;
