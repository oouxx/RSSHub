module.exports = function (router) {
    router.get('/announcement/daily/:column/:search?', require('./dailyAnn'));
    router.get('/interactiveAnswer/:search?', require('./interactiveAnswer'));
};
