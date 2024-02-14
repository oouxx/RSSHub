module.exports = function (router) {
    router.get('/hangyefenxi', require('./hangyefenxi'));
    router.get('/gongsiyanjiu', require('./gongsiyanjiu'));
    router.get('/touzicelue', require('./touzicelue'));
    router.get('/hongguanjingji', require('./hongguanjingji'));
};
