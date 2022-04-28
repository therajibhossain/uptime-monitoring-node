/*
 * Title: Route handler
 * Description: Application routes handling
 * Author: Rajib Hossain
 * Date: 2022-04-27 19:42
*/

//dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');

//module scaffolding
const routes = {
    'sample': sampleHandler,
    'user' : userHandler,
};

module.exports = routes;