var mongoose = require('mongoose');

var that = this;
var dataFolder = "";

var schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    guid: String,
    email: String,
    accountOrigin: String,
    anonymous: Boolean
});

var model = mongoose.model('users', schema, 'users');

function findOne(guid, next) {
    model.findOne({guid: guid}, function(err, user) {
        next(err, user);
    });
}

function findOrCreate(profile, next) {

    var email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : false;

    if (email) {

        model.findOne({email: email}, function(err, doc) {

            if (doc) {
                next(err, doc);
            } else {

                var user = new model({
                    email: email,
                    guid: randomString(64)
                });

                user.save(function(err, doc) {
                    next(err, doc);
                });

            }

        });

    }

}

function randomString(bits) {
    var chars,rand,i,ret;

    chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    ret='';

    // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
    while(bits > 0) {
        rand = Math.floor(Math.random()*0x100000000); // 32-bit integer

        // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
        for(i=26; i>0 && bits>0; i-=6, bits-=6) ret+=chars[0x3F & rand >>> i];
    }
    return ret;
}


exports.findOrCreate = findOrCreate;
exports.findOne = findOne;
