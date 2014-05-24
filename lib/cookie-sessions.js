module.exports = function(name) {
    return function(req, res, next) {
        req.session = req.signedCookies[name] || {};

        res.on('header', function(){
            res.signedCookie(name, req.session, { signed: true });
        });

        next();
    }
}
