module.exports = function (router) {
    router.get('/index', require('./index'));
    router.get('/user/:id', require('./user'));
    router.get('/action', require('./action'));

};
