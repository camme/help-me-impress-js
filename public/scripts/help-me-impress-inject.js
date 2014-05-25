(function() {

    var socket = io.connect('!!!connectionurl!!!');
    var guid = '!!!guid!!!';

    var scriptId = "impress";

    if (location.href.indexOf("helpmeimpressjsid=current") > -1) {
        scriptId = "current";
    } else if (location.href.indexOf("helpmeimpressjsid=next") > -1) {
        scriptId = "next";
    }

    socket.on('connect', function(){

        socket.emit('impress.loaded', { scriptId: scriptId, url: location.href, guid: guid, title: document.title });

        if (scriptId == "impress") {

            bindPresentation();


            socket.on("impress.control.prev", function(e) {
                var api = impress();
                api.prev();
            });

            socket.on("impress.control.next", function(e) {
                var api = impress();
                api.next();
            });

        }

        if (scriptId == "next") {
            var api = impress();
            api.next();
        }

        socket.on('event', function(data){});
        socket.on('disconnect', function(){});

        socket.on("impress.gotoNext", function(e) {
            var api = impress();
            api.goto(e.id);
            api.next();
        });

        socket.on("impress.goto", function(e) {
            var api = impress();
            api.goto(e.id);
        });

        socket.on("impress.askforstatus", function(e) {
            socket.emit('impress.loaded', { scriptId: scriptId, url: location.href, guid: guid, title: document.title });
        });
  
    });

    function bindPresentation() {

        document.addEventListener("impress:stepenter", function (event) {
            var stepId = event.target.id;
            socket.emit("impress.step", { guid: guid, id: stepId});
        });

    }

})();

