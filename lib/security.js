var express = require('express');
var passport = require('passport')
var config = require('../config-manager');
var users = require('./user-model');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function init(app) {

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/login', function(req, res){
        req.logout();
        res.redirect('/auth/google');
    });


    passport.serializeUser(function(user, done) {
        done(null, user.guid);    // id stored in a delicious cookie
    });

    passport.deserializeUser(function(id, done) {
        users.findOne(id, function(err, user) {
            done(err, user); 
        });
    });

    passport.use(new GoogleStrategy({
        clientID: config.google.key,
        clientSecret: config.google.secret,
        callbackURL: config.server.url + "/auth/google/callback"
    },

    function(accessToken, refreshToken, profile, done) {
        users.findOrCreate(profile, function(err, user) {
            done(err, user);
        });
    }));

    app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.email' }));

    app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));

};

exports.ensure = function(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    }
    res.redirect('/login');
}

exports.init = init;
