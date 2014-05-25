var secrets = require('./development-secrets');

exports.server = {
    port: 8888,
    url: "http://help-me-impress.local.io"
};

exports.google = secrets.google;

exports.mongodb = 'mongodb://localhost/help-me-impress-development';

