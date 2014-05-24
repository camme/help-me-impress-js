requirejs.config({

    shim: {
        'socketio': {
            exports: 'io'
        }
    },

    paths: {
        styles: "../styles",
        text: "lib/requirejs-smartcss/text",
        smartcss: "lib/requirejs-smartcss/smartcss",
        font: "lib/font",
        domReady: "lib/domReady",
        propertyParser: "lib/propertyParser",
        socketio: '/socket.io/socket.io.js?'
    }

});
