/*
 * Title: Not found Handler
 * Description: 404 Not found Handler
 * Author: Rajib Hossain
 * Date: 2022-04-27 19:47
*/

//module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested URL was not found!',
    });
}

module.exports = handler;