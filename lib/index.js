// the event framework

var mongoose = require('mongoose');
var path = require("path");
var fs = require('fs');
var http = require('http');

var config = require('../config-manager');

var passport = require('passport')
var express = require('express');
var app = express();
var server = http.createServer(app);
var connect = require('connect');
var io = require('./io-helper').init(server);

var session      = require('express-session');

var cookieParser = require('cookie-parser');

var sessionStore = new connect.middleware.session.MemoryStore();

var doT = require('express-dot');

var presenterControl = require("./presenter-control");

function init(next) {

    // define rendering engine
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.use(cookieParser("superhemligt"));
    //app.use(express.bodyParser());
    app.use(session({ store: sessionStore }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Add headers
    app.use(function (req, res, next) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*:*');
        res.setHeader('Access-Control-Allow-Credentials', false);
        next();
    });

    app.set('views', path.join(__dirname, "../views"));
    app.set('view options', { layout: false });
    app.set('view engine', 'html' );
    app.engine('html', doT.__express );

    require('./routes').init(app);
    require('./security').init(app);

    mongoose.connect(config.mongodb, function(err) {

        var SessionSockets = require('session.socket.io');
        var sessionSockets = new SessionSockets(io, sessionStore, cookieParser("superhemligt"));

        sessionSockets.on('connection', function (err, socket, session) {
            socket.session = session;
        });

        // connect the socket server
        server.listen(config.server.port, next);

    });

};

exports.init = init;
exports.server = server;




