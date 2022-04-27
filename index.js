/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Rajib Hossain ( Learn with Sumit )
 * Date: 2022-04-27 15:27
*/

//dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/HandleReqRes');

//app object - module scaffolding
const app = {};

//configuration
app.config = {
    port: 3000,
};

//creating server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`listening to port ${app.config.port}`);
    });
}

//handle request response
app.handleReqRes = handleReqRes;

//create the server
app.createServer();