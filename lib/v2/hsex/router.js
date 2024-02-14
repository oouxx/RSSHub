// hsex.men
module.exports = function (router) {
    router.get('/latest', require('./latest'));
    router.get('/weekly', require('./weekly'));
    router.get('/monthly', require('./monthly'));
    router.get('/10min', require('./10minlength'));
    router.get('/5min', require('./5minlength'));
};
