define(function(require) {

    if (HMIJS.page != "presenter") {
        return;
    }

    var domReady = require('lib/domready');
    var socket = require('socket');
    var next;
    var current;
    var hoursDom;
    var minutesDom;
    var secondsDom;
    var commentInput;
    var saveTimeout = -1;

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

        setInterval(clock, 900);

        document.querySelector(".reset-clock").addEventListener("click", function(e) {
            start = new Date();
            clock();
        }, false);

        next.addEventListener("click", function(e) {
            this.blur();
        }, false);

        current.addEventListener("click", function(e) {
            this.blur();
        }, false);

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

    socket.on('connect', function() {
        socket.emit("presenter.connect", { guid: HMIJS.guid });
    });

    socket.on("impress.step", function(e) {
        currentStep = e.id;
    });

    socket.on("presenter.comments", showComments);

    socket.on('impress.loaded', function(e) {

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

});












