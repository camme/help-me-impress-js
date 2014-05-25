var secrets = require('./configs/production-secrets');

exports.server = {
    port: 8888,
    url: "http://help-me-impress.1001.io"
};

exports.google = secrets.google;

exports.mongodb = 'mongodb://localhost/help-me-impress-development';

