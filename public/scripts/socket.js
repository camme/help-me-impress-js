define(['socketio'], function(io) {
    var socket = io.connect("http://" + location.host);
    return socket;
});
