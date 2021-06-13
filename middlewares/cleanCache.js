
const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next(); // There are some case when we don't want to dump the cache (eg. if there is a mongodb error). 
    // The next function will execute the route middleware


    clearHash(req.user.id); // this will be executed when the route middleware is finished
}