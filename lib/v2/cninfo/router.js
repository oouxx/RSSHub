module.exports = function (router) {
    router.get('/announcement/daily/:search?', require('./dailyAnn'));
    router.get('/interactiveAnswer/:search?', require('./interactiveAnswer'));
};
