const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

module.exports = function(passport){

    // local strategy
    passport.use(new localStrategy(function(username,password,done){

        User.findOne({username:username},function(err,user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message:'No user found'});
            }

            // compare passwords
            bcrypt.compare(password, user.password,function(err, isMatch){
                if(err) throw err
                if(isMatch){
                    return done(null,user)
                }else{
                    return done(null,false,{message:'Wrong password or email'})
                }
            })
        })
    }));

    passport.serializeUser(function(user,done){
        done(null, user.id)
    });

    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user)
        })
    })
}