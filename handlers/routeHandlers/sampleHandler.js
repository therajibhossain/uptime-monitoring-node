/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Rajib Hossain
 * Date: 2022-04-27 19:47
*/

//module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'This is a sample url',
    });
}

module.exports = handler;