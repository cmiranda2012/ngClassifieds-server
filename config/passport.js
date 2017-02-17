const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../app/models/user');
const config = require('../config/db');
 
module.exports = function(passport) {
  
  var opts = {};

  //secretOrKey required (contains the secret)
  opts.secretOrKey = config.secret;
  
  //new JwtStrategy(opts, verify)
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    
    User.findOne({
      id: jwt_payload.id
    }, function(err, user) {
          
          if (err) {
              return done(err, false);
          }

          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
      });

  }));

};
