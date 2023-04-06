module.exports = function (router) {
    router.get('/bbs', require('./bbs'));
    router.get('/fangfalun', require('./fangfalun'));
    router.get('/geguyanjiu', require('./geguyanjiu'));
    router.get('/user/:uid', require('./user'));
    // router.get('/reply/:uid', require('./reply'));
    router.get('/newsjiahong', require('./newsjiahong'));
    router.get('/other', require('./other'));
    router.get('/recommend', require('./recommend'));
    router.get('/wangyoujingxuan', require('./wangyoujingxuan'));
};
