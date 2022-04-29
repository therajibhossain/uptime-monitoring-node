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

//create random string
utilities.createRandomString = (strLength) => {
    let length = strLength;
    length = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;

    if(length) {
        let possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));
            output += randomCharacter;            
        }

        return output;
    }else {
        return false;
    }
}

module.exports = utilities;