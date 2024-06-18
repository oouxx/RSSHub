module.exports = function (router) {
    router.get('/index', require('./index'));
    router.get('/latest', require('./latest'));
    router.get('/user/:uid', require('./user'));
    router.get('/action/:date?', require('./action'));
};
