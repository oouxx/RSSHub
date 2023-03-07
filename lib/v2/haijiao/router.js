module.exports = function (router) {
    router.get('/lunli/hot/:limit', require('./lunli/hot-post'));
};
