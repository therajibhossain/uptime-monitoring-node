/*
 * Title: Check handler
 * Description: 
 * Author: Rajib Hossain
 * Date: 2022-04-30 17:37
*/
//dependencies
const data = require('../../lib/data');
const {hash, parseJSON, createRandomString} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const {maxChecks} = require('../../helpers/environments');

//module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
   const acceptedMethods = ['get', 'post', 'put', 'delete'];
   if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
   }else {
       callback(405);
   }
}

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    //validate inputs
    const body = requestProperties.body;

    let protocol = (typeof(body.protocol) === 'string' && ['http', 'https'].indexOf(body.protocol) > -1) ? body.protocol : false;
    let url = (typeof(body.url) === 'string' && body.url.trim().length > 0) ? body.url : false;
    let method = (typeof(body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(body.method) > -1) ? body.method : false;
    let successCodes = (typeof(body.successCodes) === 'object' && body.successCodes instanceof Array) ? body.successCodes : [];
    let timeoutSeconds = ((typeof(body.timeoutSeconds) === 'number') && (body.timeoutSeconds % 1 === 0) && (body.timeoutSeconds >= 1) && (body.timeoutSeconds <= 5)) ? body.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds) {
        const headersObject = requestProperties.headersObject; 
        const token = typeof(headersObject.token) === 'string' ? headersObject.token : false;

        //lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if(!err1 && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                let phone = userPhone;

                //lookup the user 
                data.read('users', phone, (err2, userData) => {
                    if(!err2 && userData) {
                        tokenHandler._token.verify(token, phone, (tokenIsValid) => {
                            if(tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxChecks)  {
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        id: checkId,
                                        userPhone: userObject.phone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    //save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if(!err3) {
                                            //add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user data
                                            data.update('users', phone, userObject, (err4) => {
                                                if(!err4) {
                                                    callback(200, checkObject);
                                                }else {
                                                    callback(500, {
                                                        error: err4
                                                    });
                                                }
                                            });
                                        }else {
                                            callback(500, {
                                                error: err3
                                            });
                                        }
                                    });
                                }else {
                                    callback(401, {
                                        error: 'User already reached max check limit'
                                    });
                                }

                            }else {
                                callback(403, {
                                    error: 'Authentication failure'
                                });
                            }
                        });
                    }else {
                        callback(403, {
                            error: 'User not found'
                        });
                    }
                });
            }else {
                callback(403, {
                    error: 'Authentication failure'
                });
            }
        });
    }else {
        callback(400, {
            error: 'You have problem in your request'
        });
    }

};

handler._check.get = (requestProperties, callback) => {
    const queryStringObject = requestProperties.queryStringObject;
    //check the id if valid
    const id = (typeof(queryStringObject.id) === 'string' && queryStringObject.id.trim().length === 20) ? queryStringObject.id : false;
    if(id) {
        //lookup the check
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {
                const checkObject = parseJSON(checkData);
                handler._check.verifyAuth(requestProperties, checkObject.userPhone, (tokenId) => { 
                    if(tokenId) {
                        callback(200, checkObject);
                    }else {
                        callback(403, {
                            error: 'Authentication failure!'
                        });
                    }
                });

            }else {
                callback(500, {
                    error: err
                });
            }
        });
    }else {
        callback(400, {
            error: 'You have problem in your request'
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    //validate inputs
    const body = requestProperties.body;
    let id = (typeof(body.id) === 'string' && body.id.length === 20) ? body.id : false;
    let protocol = (typeof(body.protocol) === 'string' && ['http', 'https'].indexOf(body.protocol) > -1) ? body.protocol : false;
    let url = (typeof(body.url) === 'string' && body.url.trim().length > 0) ? body.url : false;
    let method = (typeof(body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(body.method) > -1) ? body.method : false;
    let successCodes = (typeof(body.successCodes) === 'object' && body.successCodes instanceof Array) ? body.successCodes : [];
    let timeoutSeconds = ((typeof(body.timeoutSeconds) === 'number') && (body.timeoutSeconds % 1 === 0) && (body.timeoutSeconds >= 1) && (body.timeoutSeconds <= 5)) ? body.timeoutSeconds : false;

    if(id) {
        if(protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if(!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    handler._check.verifyAuth(requestProperties, checkObject.userPhone, (tokenId) => { 
                        if(tokenId) {
                            if(protocol) {
                                checkObject.protocol = protocol;
                            }
                            if(url) {
                                checkObject.url = url;
                            }
                            if(method) {
                                checkObject.method = method;
                            }
                            if(successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            //update the check object
                            data.update('checks', id, checkObject, (err2) => {
                                if(!err2) {
                                    callback(200);
                                }else {
                                    callback(500, {
                                        error: err2
                                    });
                                }
                            });
                        }else {
                            callback(403, {
                                error: 'Authentication failure!'
                            });
                        }
                    });

                }else {
                    callback(500, {
                        error: err1
                    });
                }
            });
        }else {
            callback(400, {
                error: 'You must provide atleast one field to update'
            });
        }
    }else {
        callback(400, {
            error: 'You have problem in your request'
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const body = requestProperties.body;
    let id = (typeof(body.id) === 'string' && body.id.length === 20) ? body.id : false;
    
    if(id) {
        //lookup the check
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData) {
                const checkObject = parseJSON(checkData);
                handler._check.verifyAuth(requestProperties, checkObject.userPhone, (tokenId) => { 
                    if(tokenId) {                        
                        //delete the check data
                        data.delete('checks', id, (err1) => {
                            if(!err1) {
                                data.read('users', checkObject.userPhone, (err2, userData) => {
                                    if(!err2 && userData) {
                                        let userObject = parseJSON(userData);
                                        let userChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //remove the deleted check id from user's list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1) {
                                            userChecks.slice(checkPosition, 1);

                                            //resave the user data
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err3) => {
                                                if(!err3) {
                                                    callback(200);
                                                }else {
                                                    callback(500, {
                                                        error: err3
                                                    });
                                                }
                                            });
                                        }else {
                                            callback(500, {
                                                error: 'You are trying to delete the id may not found'
                                            });
                                        }
                                    }else {
                                        callback(500, {
                                            error: err2
                                        });
                                    }
                                });
                            }else {
                                callback(500, {
                                    error: 500
                                });
                            }
                        });

                    }else {
                        callback(403, {
                            error: 'Authentication failure!'
                        });
                    }
                });

            }else {
                callback(500, {
                    error: err
                });
            }
        });
    }else {
        callback(400, {
            error: 'You have problem in your request'
        });
    }
};

handler._check.verifyAuth = (requestProperties, phone, callback) => { 
    //verify token
    const headersObject = requestProperties.headersObject; 
    let token = typeof(headersObject.token) === 'string' ? headersObject.token : false;
    tokenHandler._token.verify(token, phone, (tokenId) => { 
        callback(tokenId);
    });
};

module.exports = handler;