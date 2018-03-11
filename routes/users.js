const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport')


// Register 
router.get('/register',function(req,res){
    res.render('register')
});

// register  user
router.post('/register',function(req,res){
    //validate details
    req.checkBody('name','name is required').notEmpty();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'Enter valid email').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'password do not match').equals(req.body.password);

    let errors = req.validationErrors();
    if(errors){
       res.render('register',{
           errors: errors
       })
    }else{
            let user = new User({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            
            //generate salt 
            bcrypt.genSalt(10,function(err,salt){
                // hash the password
                bcrypt.hash(user.password,salt,function(err,hash){
                    if(err){
                        console.log(err)
                    }else{
                        user.password = hash
                        // save user
                        user.save(function(err){
                            if(err){
                                console.log(err)
                            }else{
                                req.flash('success','Successfully registerd and login')
                                res.redirect('/users/login')
                            }
                        })
                    }
                })
            })
    }  
});

// login
router.get('/login', function(req,res){
    res.render('login')
})

router.post('/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next)
});

// logout
router.get('/logout', function(req,res){
    req.logout();
    req.flash('success','You r logged out')
    res.redirect('/')
})

module.exports = router;