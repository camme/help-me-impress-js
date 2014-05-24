var model = require("./presenter-model");
var io = require('./io-helper').io;

var socketCache = {};

io.sockets.on("connection", function(socket) {

    socket.on("presenter.create", function(e) {

        var userGuid = getUserId(socket);

        if (userGuid) {
            var markdown = e.markdown;
            var name = e.name;
            model.create(userGuid, name, function(err, presentation) {
                socket.emit("presenter.created", {presentation: presentation, sessionId: e.sessionId});
            });
        } else {
            sendPleaseLogin(socket, "presenter.created");
        }

    });

    socket.on("impress.loaded", function(e) {

        var presenterSockets = getPresenterSockets(e.guid);
        presenterSockets[e.scriptId] = socket;

        if (e.scriptId == "impress") {
            if (presenterSockets.presenter) {

                presenterSockets.presenter.emit("impress.loaded", e);

                var step = e.url.substring(e.url.indexOf("/#"));
                if (step) {
                    var currentStep = step.replace(/\/#\//g, '');
                    model.getComments(e.guid, currentStep, function(err, comments) {
                        presenterSockets.presenter.emit("presenter.comments", { comments: comments, step: currentStep, guid: e.guid });
                    });
                }

            }
        }

    });


    socket.on("presenter.comments.save",  function(e) {
        model.saveComment(e.guid, e.step, e.comment, function(err) {
            if (err) {
                socket.emit('presenter.error', { message: "error when saving comment" });
            } else {
                socket.emit('presenter.comment.saved');
            }
        });
    });

    socket.on("impress.step", function(e) {

        var presenterSockets = getPresenterSockets(e.guid);

        if (presenterSockets.presenter) {

            presenterSockets.presenter.emit("impress.step", e);

            model.getComments(e.guid, e.id, function(err, comments) {
                presenterSockets.presenter.emit("presenter.comments", { comments: comments, step: e.id, guid: e.guid });
            });

        }
        if (presenterSockets.next) {
            presenterSockets.next.emit("impress.gotoNext", e);
        }
        if (presenterSockets.current) {
            presenterSockets.current.emit("impress.goto", e);
        }

    });

    socket.on("presenter.connect", function(e) {

        var presenterSockets = getPresenterSockets(e.guid);
        presenterSockets.presenter = socket;

        if (presenterSockets.impress) {
            presenterSockets.impress.emit("impress.askforstatus");
        }

    });



});

function getPresenterSockets(guid) {
    if (!socketCache[guid]) {
        socketCache[guid] = {};
    }
    return socketCache;
}

function sendPleaseLogin(socket, original) {
    socket.emit("error.notloggedin", { original: original });
}

function getUserId(socket) {

    var id = "";
    if (socket && socket.session && socket.session.user) {
        id = socket.session.user.guid;
    }

    return id;

}

