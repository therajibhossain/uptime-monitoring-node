/*
 * Title: Token Handler
 * Description: 
 * Author: Rajib Hossain
 * Date: 2022-04-29 20:05
*/

//dependencies
const { hash, createRandomString, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');
// const {hash, parseJSON} = require('../../helpers/utilities');

//module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
   const acceptedMethods = ['get', 'post', 'put', 'delete'];
   if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
   }else {
       callback(405);
   }
}

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const body = requestProperties.body;
    const phone = (typeof(body.phone) === 'string' && body.phone.trim().length === 11) ? body.phone : false;
    const password = (typeof(body.password) === 'string' && body.password.trim().length > 0) ? body.password : false;

    if(phone && password) {
        data.read('users', phone, (err1, userData) => {
            let hashedpassword = hash(password);
            if(hashedpassword === parseJSON(userData).password) {
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 *1000;
                let tokenObject = {
                    phone,
                    'id' : tokenId,
                    expires
                };

                //store to db
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if(!err2) {
                        callback(200, tokenObject);
                    }else {
                        callback(500, {
                            error: err2
                        })
                    }
                });
            }else {
                callback(400, {
                    error: 'Password not valid'
                })
            }
        });
    }else {
        callback(404, {
            error: 'You have a problem with your request'
        });
    }

};

handler._token.get = (requestProperties, callback) => {
    const queryStringObject = requestProperties.queryStringObject;

    //check the id if valid
    const id = (typeof(queryStringObject.id) === 'string' && queryStringObject.id.trim().length === 20) ? queryStringObject.id : false;
    if(id) {
        //lookup the token
        data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                const token = { ...parseJSON(tokenData) };
                callback(200, token);
            }else {
                callback(404, {
                    error: 'token not found'
                })
            }
        });
    }else {
        callback(404, {
            error: 'Requested token was not found'
        })
    }
};
    
handler._token.put = (requestProperties, callback) => {
    const body = requestProperties.body;
    const id = (typeof(body.id) === 'string' && body.id.trim().length === 20) ? body.id : false;
    const extend = (typeof(body.extend) === 'boolean' && body.extend === true) ? true : false;

    if(id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                //store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if(!err2) {
                        callback(200);
                    }else {
                        callback(500, {
                            error: err2
                        });
                    }
                });
            }else {                
                callback(400, {
                    error: 'Token already expired'
                });
            }
        });
    }else {
        callback(400, {
            error: 'There was a problem in your request'
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    const queryStringObject = requestProperties.queryStringObject;
    //check the token if valid
    const id = (typeof(queryStringObject.id) === 'string' && queryStringObject.id.trim().length === 20) ? queryStringObject.id : false;
    if(id) {
        //lookup the token
        data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if(!err2) {
                        callback(200, {
                            message: 'Token deleted'
                        });
                    }else {
                        callback(500, {
                            error: err2
                        });
                    }
                 })
            }else {
                callback(500, {
                    error: 'Requested token was not found'
                })
            }
        });
    }else {
        callback(404, {
            error: 'Requested token was not found'
        })
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        const tokenObject =  parseJSON(tokenData);
        if(!err && tokenData) {
            if(tokenObject.phone === phone && tokenObject.expires > Date.now()) {
                callback(true);
            }else {
                callback(false);
            }
        }else {
            callback(false);
        }
    });
};

module.exports = handler;