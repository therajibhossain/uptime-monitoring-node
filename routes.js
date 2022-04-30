/*
 * Title: Route handler
 * Description: Application routes handling
 * Author: Rajib Hossain
 * Date: 2022-04-27 19:42
*/

//dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const {userHandler} = require('./handlers/routeHandlers/userHandler');
const {checkHandler} = require('./handlers/routeHandlers/checkHandler');

//module scaffolding
const routes = {
    'sample': sampleHandler,
    'user' : userHandler,
    'token': tokenHandler,
    'check': checkHandler
};

module.exports = routes;