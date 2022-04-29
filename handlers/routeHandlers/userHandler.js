/*
 * Title: User Handler
 * Description: Route Handler to handle user related routes
 * Author: Rajib Hossain
 * Date: 2022-04-28 22:23
*/

//dependencies
const data = require('../../lib/data');
const {hash, parseJSON} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

//module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
   const acceptedMethods = ['get', 'post', 'put', 'delete'];
   if(acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
   }else {
       callback(405);
   }
}

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const body = requestProperties.body;

    const firstName = (typeof(body.firstName) === 'string' && body.firstName.trim().length > 0) ? body.firstName : false;
    const lastName = (typeof(body.lastName) === 'string' && body.lastName.trim().length > 0) ? body.lastName : false;
    const phone = (typeof(body.phone) === 'string' && body.phone.trim().length === 11) ? body.phone : false;
    const password = (typeof(body.password) === 'string' && body.password.trim().length > 0) ? body.password : false;
    const tosAgreement = (typeof(body.tosAgreement) === 'boolean') ? body.tosAgreement : false;        

    if(firstName && lastName && phone && password && tosAgreement) {
        //make sure that the user doesn't exist
        data.read('users', phone, (err, user) => {
            if(err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };

                // console.log(userObject);

                //store to db
                data.create('users', phone, userObject, (err2) => {
                    if(!err2) {
                        callback(200, {
                            message: 'User was created successfully'
                        })
                    }else {
                        callback(500, {
                            error: err2
                        });
                    }
                });
            }else {
                callback(500, {
                    error: 'The phone number already exists',
                })
            }
        });
    }else {
        callback(400, {
            error: 'Please submit all the required fields'
        });
    }
};

handler._users.get = (requestProperties, callback) => {
    const queryStringObject = requestProperties.queryStringObject;
    //check the phone if valid
    const phone = (typeof(queryStringObject.phone) === 'string' && queryStringObject.phone.trim().length === 11) ? queryStringObject.phone : false;
    if(phone) {
        //verify token
        handler._users.verifyAuth(requestProperties, phone, (tokenId) => { 
            if(tokenId) {
                data.read('users', phone, (err, u) => {
                    if(!err && u) {
                        const user = { ...parseJSON(u) };
                        delete user.password;
                        callback(200, user);
                    }else {
                        callback(404, {
                            error: 'user not found'
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
        callback(404, {
            error: 'Requested user was not found'
        });
    }
};

handler._users.put = (requestProperties, callback) => {
    const body = requestProperties.body;

    const firstName = (typeof(body.firstName) === 'string' && body.firstName.trim().length > 0) ? body.firstName : false;
    const lastName = (typeof(body.lastName) === 'string' && body.lastName.trim().length > 0) ? body.lastName : false;
    const phone = (typeof(body.phone) === 'string' && body.phone.trim().length === 11) ? body.phone : false;
    const password = (typeof(body.password) === 'string' && body.password.trim().length > 0) ? body.password : false;
    if(phone) {
        
        if(firstName || lastName || password) {
             //verify token
            handler._users.verifyAuth(requestProperties, phone, (tokenId) => { 
                if(tokenId) {
                    //look up the user
                    data.read('users', phone, (err, uData) => {
                        const userData = { ...parseJSON(uData) };

                        if(!err && userData) {
                            if(firstName) {
                                userData.firstName = firstName;
                            }
                            
                            if(lastName) {
                                userData.lastName = lastName;
                            } 
                            
                            if(password) {
                                userData.password = hash(password);
                            }

                            //store to db
                            data.update('users', phone, userData, (err2) => {
                                if(!err2) {
                                    callback(200, {
                                        message: 'User updated successfully'
                                    })
                                }else {
                                    callback(500, {
                                        error: err2
                                    })
                                }
                            });
                        }else {
                            callback(404, {
                                error: err
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
            callback(400, {
                error: 'You must put the change info'
            });
        }
    }else {
        callback(400, {
            error: 'Invalid phone number, plz try again'
        });
    }
};

handler._users.delete = (requestProperties, callback) => {
    const queryStringObject = requestProperties.queryStringObject;
    //check the phone if valid
    const phone = (typeof(queryStringObject.phone) === 'string' && queryStringObject.phone.trim().length === 11) ? queryStringObject.phone : false;
    if(phone) {

        handler._users.verifyAuth(requestProperties, phone, (tokenId) => { 
            if(tokenId) {
                //lookup the user
                data.read('users', phone, (err, userData) => {
                    if(!err && data) {
                        data.delete('users', phone, (err2) => {
                            if(!err2) {
                                callback(200, {
                                    message: 'User deleted'
                                });
                            }else {
                                callback(500, {
                                    error: err2
                                });
                            }
                        })
                    }else {
                        callback(500, {
                            error: 'Requested user was not found'
                        })
                    }
                });
            }else {
                callback(403, {
                    error: 'Authentication failure!'
                });
            }
        });
        
    }else {
        callback(404, {
            error: 'Requested user was not found'
        })
    }
};

handler._users.verifyAuth = (requestProperties, phone, callback) => { 
    //verify token
    const headersObject = requestProperties.headersObject; 
    let token = typeof(headersObject.token) === 'string' ? headersObject.token : false;
    tokenHandler._token.verify(token, phone, (tokenId) => { 
        callback(tokenId);
    });
};

module.exports = handler;