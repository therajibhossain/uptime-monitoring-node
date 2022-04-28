/*
 * Title: Utilities
 * Description: Important utility functions
 * Author: Rajib Hossain
 * Date: 2022-04-28 22:54
*/

//dependencies
const crypto = require('crypto');
const envirnoments = require('./environments');

//module scaffolding
const utilities = {};

//parse JSON string to Object
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    }catch {
        output = {};
    }

    return output;
}

//hash string
utilities.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0) { 
        let hash = crypto.createHmac('sha256', envirnoments.secretKey).update(str).digest('hex');
        return hash;
    }

    return false;
}



module.exports = utilities;