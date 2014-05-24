
var socketIo = require('socket.io');

exports.io = null;

exports.init = function(server) {
    exports.io =  socketIo.listen(server, {log: false});
    exports.io.set("origins","*:*");
    exports.io.set("credentials","false");
    return exports.io;
}
