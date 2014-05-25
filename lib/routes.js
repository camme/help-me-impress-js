//var moments = 
var fs = require('fs');
var request = require('request');
var path = require("path");
var security = require('./security');
var config = require('../config-manager');
var userModel = require('./user-model');
var presenterModel = require('./presenter-model');
var socketJSClient = null;
var helpMeImpressInjectJS = null;


exports.init = function(app) {
    app.get("/status", check);
    app.get("/", index);
    app.get("/dashboard", dashboard);
    app.get("/dashboard/:guid", presenterScreen);
    app.get("/embed/:guid", embedCode);
}

function index(req, res) {
    check(req, res, function(user) {
        if (user) {
            res.redirect('/dashboard');
            return;
        }
        res.render("index", { user: user });
    });
};

function dashboard(req, res) {
    check(req, res, function(user) {
        if (!user) {
            res.redirect('/login');
            return;
        }
        presenterModel.getList(user.guid, function(err, list) {
            list.forEach(function(presenter) {
                presenter.title = presenter.title ? presenter.title : "[not connected yet]";
                presenter.embed = '<script type="text/javascript" src="' + config.server.url + "/embed/" + presenter.guid + '.js"' + '></script>';
            })
            res.render("dashboard", { list: list, user: user });
        });
    });
};

function presenterScreen(req, res) {

    check(req, res, function(user) {

        if (user && req.params.guid) {

            presenterModel.findOne(req.params.guid, function(err, presenter) {

                if (presenter) {

                    req.session.presenter = presenter.guid;
                    req.session.save();

                    var embed = '<script type="text/javascript" src="' + config.server.url + "/embed/" + presenter.guid + '.js"' + '></script>';
                    res.render("presenter", { 
                        user: user ,
                        embed: embed,
                        guid: presenter.guid,
                        url: presenter.url,
                        title: presenter.title ? presenter.title : "[not connected yet]",
                        connected: presenter.title !== '' && !presenter.title ? false : true
                    });

                } else {
                    res.statusCode = 404;
                    res.render("404");
                }

            });

        } else {
            res.redirect("/login");
        }

    });

};



function embedCode(req, res) {

    var guid = req.params.guid.replace(".js", "");
    presenterModel.findOne(guid, function(err, presenter) {

        if (presenter) {

            getSocketJS(function(socketScript) {
            getHelpMeImpressInjectJS(function(script) {

                var localUrl = config.server.url;
                //if (localUrl.indexOf(":") == -1) {
                localUrl += ":80";
                //}

                script = script.replace(/!!!connectionurl!!!/g, localUrl);
                script = script.replace(/!!!guid!!!/g, guid);

                res.type("text/javascript");
                res.send(socketScript + script);

            });

            });

        } else {
            res.statusCode = 404;
            res.render("404");
        }

    });

};


function getSocketJS(next) {
    if (!socketJSClient) {
        request.get(config.server.url + "/socket.io/socket.io.js", function(err, req, body) {
            socketJSClient = body;
            next(socketJSClient); 
        });
    } else {
        next(socketJSClient);
    }
}

function getHelpMeImpressInjectJS(next) {
    if (!helpMeImpressInjectJS) {
        fs.readFile(path.join(__dirname, "../public/scripts/help-me-impress-inject.js"), 'utf8', function(err, script) {
            //helpMeImpressInjectJS = script;
            next(script); 
        });
    } else {
        next(helpMeImpressInjectJS);
    }
}



function check(req, res, next) {

    if (req.user) {

        next(req.user);

    } else {

        var userGuid = req.signedCookies.user;

        if (userGuid) {

            userModel.findOne(userGuid, function(err, user) {

                if (user) {

                    req.session.user = user;
                    req.session.save();
                    req.user = user;

                    next(req.user);

                } else {

                    next();

                }

            });

        } else {

            next();

        }

    }

}


