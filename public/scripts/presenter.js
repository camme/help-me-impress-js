define(function(require) {

    if (HMIJS.page != "presenter") {
        return;
    }

    var domReady = require('lib/domready');
    var socket = require('socket');
    var modal = require('modal');
    var next;
    var current;
    var hoursDom;
    var minutesDom;
    var secondsDom;
    var commentInput;
    var embedModal;
    var connectWarningModal;
    var saveTimeout = -1;
    var showConnectWarningTimeout = -1;

    var currentStep = "";

    var start = new Date();

    domReady(function() {

        next = document.getElementById("preview-next");
        current = document.getElementById("preview-current");
        commentHeader = document.getElementById("step-id");
        commentInput = document.getElementById("comments");
        hoursDom = document.querySelector(".hours");
        minutesDom = document.querySelector(".minutes");
        secondsDom = document.querySelector(".seconds");
        embedModal = modal(document.querySelector("#embed-modal"));
        connectWarningModal = modal(document.querySelector("#connect-warning-modal"));

        // If impress hasnt be connected to the presneter screen yet, we show the embed code
        if (!HMIJS.connected) {
            embedModal.show();
        } else {

            // We set a timer to make sure we show a waring if we dont get a connection to the impress presentation
            showConnectWarningTimeout = setTimeout(showConnectWarning, 1000);

        }

        // Bind the button to reset the clock
        document.querySelector(".reset-clock").addEventListener("click", function(e) {
            start = new Date();
            clock();
        }, false);

        // If the input with the embed code is clicked, make sure we mark all
        document.querySelector(".embed-code").addEventListener("click", function(e) {
            this.select();
        }, false);

        next.addEventListener("click", function(e) {
            this.blur();
        }, false);

        current.addEventListener("click", function(e) {
            this.blur();
        }, false);

        // Save on keyup
        commentInput.addEventListener("keyup", function(e) {

            if (currentStep == "") {
                return;
            }

            var commentContent = this.value;

            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(function() {

                socket.emit("presenter.comments.save", {
                    comment: commentContent,
                    guid: HMIJS.guid,
                    step: currentStep
                });

            }, 300);

        }, false);

    });


    // When we connect to the socker, we tell it that we are the presenter socket
    socket.on('connect', function() {
        socket.emit("presenter.connect", { guid: HMIJS.guid });
    });


    // The impress presentation has changed so we make sure we save the current step
    socket.on("impress.step", function(e) {
        currentStep = e.id;
    });


    socket.on("presenter.comments", showComments);


    socket.on('impress.loaded', function(e) {

        clearTimeout(showConnectWarningTimeout);
        connectWarningModal.hide();

        // Hide all modals now that we know that the impress is connected
        embedModal.hide();
        connectWarningModal.hide();

        setInterval(clock, 900);

        var step = e.url.substring(e.url.indexOf("/#"));
        if (step) {
            e.url = e.url.replace(step, '');
            currentStep = step.replace(/\/#\//g, '');
        }

        var url = e.url + "?helpmeimpressjsid=current" + step;
        current.setAttribute("src", url);

        var url = e.url + "?helpmeimpressjsid=next" + step;
        next.setAttribute("src", url);

        document.querySelector("h1").innerHTML = e.title;

        // bind controls
        document.querySelector("#button-next").addEventListener("click", function() {
            socket.emit("presenter.control.next");
        }, false); 

        document.querySelector("#button-prev").addEventListener("click", function() {
            socket.emit("presenter.control.prev");
        }, false); 

    });

    function showComments(e) {
        commentInput.value = e.comments ? e.comments : "";
        commentHeader.innerHTML = e.step;
    }

    function clock() {

        var now = new Date();
        var delta = new Date(now.getTime() - start.getTime());

        var h = 1 - delta.getHours();
        h = h < 10 ? "0" + h : h;

        var m = delta.getMinutes();
        m = m < 10 ? "0" + m : m;

        var s = delta.getSeconds();
        s = s < 10 ? "0" + s : s;

        hoursDom.innerHTML = h;
        minutesDom.innerHTML = m;
        secondsDom.innerHTML = s;

    }

    function showConnectWarning() {
        connectWarningModal.show();
    }

});












