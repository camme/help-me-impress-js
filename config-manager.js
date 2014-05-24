var path = require("path");
var isTest = process.env.NODE_ENV ? process.env.NODE_ENV == "test" : false;

if (isTest) {
    module.exports = require(path.join(__dirname, "config", "test"));
} else {
    module.exports = require(path.join(__dirname, "config.js"));
}

