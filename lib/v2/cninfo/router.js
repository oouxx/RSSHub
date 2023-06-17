module.exports = function (router) {
    router.get('/announcement/daily', require('./announcement'));
};
