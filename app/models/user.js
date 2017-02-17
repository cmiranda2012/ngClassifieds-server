const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const saltRounds = 10;

const UserSchema = new Schema({
  name: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    }
});
 
UserSchema.pre('save', function(cb) {
    //capture variable
    var user = this;

    if (this.isNew || this.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            
            if (err) {
                return cb(err);
            }

            bcrypt.hash(user.password, salt, function(err, hash) {
                
                if (err) {
                    return cb(err);
                }

                user.password = hash;
                cb();
            });
        });
    } else {
        return cb();
    }
});
 
UserSchema.methods.matchPassword = function(pass, cb) {
    
    bcrypt.compare(pass, this.password, function(err, res) {
        
        if (err) {
            return cb(err);
        }
        
        cb(null, res);
    });
};
 
module.exports = mongoose.model('User', UserSchema);