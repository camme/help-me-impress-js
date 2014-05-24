var express = require('express');
var nunt = require('nunt');
var MemoryStore = express.session.MemoryStore;
var sessionStore = exports.sessionStore = new MemoryStore();
var exec  = require('child_process').exec;
var Session = require('connect').middleware.session.Session;
var cookieParser = express.cookieParser('superhemlig');
var queryString = require("querystring");

var connectedCallback = function (socket) {

    return;
    var hs = socket.handshake;

    // setup an inteval that will keep our session fresh
    var intervalID = setInterval(function () {
        // reload the session (just in case something changed,
        // we don't want to override anything, but the age)
        // reloading will also ensure we keep an up2date copy
        // of the session with our connection.
        hs.session.reload( function () { 
            // "touch" it (resetting maxAge and lastAccess)
            // and save it back again.
            hs.session.touch().save();
        });
    }, 1000);

    socket.on('disconnect', function () {
        //console.log('A socket with sessionID ' + hs.sessionID + ' disconnected!');
        // clear the socket interval to stop refreshing the session
        clearInterval(intervalID);
    });

};

var authorizationCallback =  function (handshake, next) {

    cookieParser(handshake, null, function(err) {

        var sessionID = handshake.signedCookies['sid'];
        sessionStore.get(sessionID, function(err, session) {
            if (err && session) {
                next(err, false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                handshake.session = new Session(handshake, session);
                console.log("HS SESSION", handshake.session);
                next(null, true);
            }
        });

    });

};

// for everytime an event comes in, we fix the data just a little to make it easier to get the user id
var setUserGuidOnEvent = function(e) {
    if (e.client.handshake.session.auth) {
        var userGuid = e.client.handshake.session.auth.userId;
        e.event.user = userGuid;
    }
};

// for everytime an event comes in, we fix the data just a little to make it easier to get the user id
nunt.on(nunt.INCOMMING_PRE_SEND, setUserGuidOnEvent);

exports.connect = connectedCallback;
exports.authorization = authorizationCallback;





