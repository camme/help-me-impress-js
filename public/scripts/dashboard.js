define(function(require) {

    if (HMIJS.page != "dashboard") {
        return;
    }

    var domReady = require('lib/domready');
    var socket = require('socket');

    domReady(function() {

        var buttonCreate = document.getElementById("button-create");
        buttonCreate.addEventListener("click", function() {
            socket.emit("presenter.create");
        });

    });

    socket.on('presenter.created', function(e) {
        location.href = "/dashboard/" + e.guid;
    });

});












