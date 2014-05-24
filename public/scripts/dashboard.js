define(function(require) {

    if (HMIJS.page != "dashboard") {
        return;
    }

    var domReady = require('lib/domready');
    var socket = require('socket');

    domReady(function() {

        var buttonCreate = document.getElementById("button-create");
        buttonCreate.addEventListener("click", function() {
            socket.emit("presenter.create", { name: "Foo" });
        });

    });

    socket.on('connect', function() {
        //console.log("connected");
    });

});












