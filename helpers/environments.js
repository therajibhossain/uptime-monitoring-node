/*
 * Title: Environment vars
 * Description: 
 * Author: Rajib Hossain
 * Date: 2022-04-28 12:27
*/

//dependencies

//module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'secretRawNode',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACd13aeda441241a59148268dc9f96c740',
        authToken: 'b77c524756604c11a44171315048ec1d'
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'secretRawNodeProduction',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACd13aeda441241a59148268dc9f96c740',
        authToken: 'b77c524756604c11a44171315048ec1d'
    }
};

//determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;