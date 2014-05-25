var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: String,
    guid: String,
    user: String,
    url: String,
    steps: mongoose.Schema.Types.Mixed
});

var model = mongoose.model('presenters', schema, 'presenters');

function findOne(guid, next) {

    if (guid) {
        model.findOne({guid: guid}, function(err, presentation) {
            next(err, presentation);
        });
    }
    else {
        next({error: "no presentation guid"});
    }

}

function getComments(guid, step, next) {
    model.findOne({guid: guid}, function(err, presentation) {
        if (presentation && presentation.steps) {
            next(null, presentation.steps[step]);
        } else {
            next(err, "");
        }
    });
}

function saveComment(guid, step, comment, next) {
    var saveData = {};
    saveData["steps." + step] = comment;
    model.update({guid: guid}, saveData, function(err) {
        next(err);
    });
}

function saveTitle(guid, title, next) {
    model.update({guid: guid}, {title: title}, function(err) {
        next(err);
    });
}

function saveUrl(guid, url, next) {
    model.update({guid: guid}, {url: url}, function(err) {
        next(err);
    });
}

function getList(user, next) {
    model.find({user: user}, next);
}

function create(user, next) {

    var presentation = new model({
        guid: randomString(64),
        user: user
    });

    presentation.save(next);

}

function save(guid, name, markdown, index, next) {
    findOne(guid, function(err, presentation) {
        if (!err) {
            presentation.save(function(err) {
                next(err);
            });
        }
        else {
            next(err);
        }
    });
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


exports.findOne = findOne;
exports.getList = getList;
exports.create = create;
exports.save = save;
exports.getComments = getComments;
exports.saveComment = saveComment;
exports.saveTitle = saveTitle;
exports.saveUrl = saveUrl;
