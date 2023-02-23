// hsex.men
module.exports = function (router) {
    router.get('/latest', require('./latest'));
    router.get('/weekly', require('./weekly'));
    router.get('/monthly', require('./monthly'));
};
