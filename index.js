/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time of user defined links
 * Author: Rajib Hossain ( Learn with Sumit )
 * Date: 2022-04-27 15:27
*/

//dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/HandleReqRes');
const envirnoment = require('./helpers/environments');
const data = require('./lib/data');
const {sendTwilioSms} = require('./helpers/notifications');

//app object - module scaffolding
const app = {};

//@todo remove later
sendTwilioSms('01740899640', 'Hello World', (err) => {
    console.log('this is the error', err);
});


//testing file system
// data.create('test', 'newFile', {'name': 'Bangladesh', 'language': 'Bangla'}, (err) => {
//     console.log(`error was`, err);
// });

// data.read('test', 'newFile', (err, data) => {
//     console.log(err, data);
// });

// data.update('test', 'newFile', {'name': 'England', 'language': 'English'}, (err) => {
//     console.log(err);
// });

// data.delete('test', 'newFile', (err) => {
//     console.log(err);
// });

//creating server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(envirnoment.port, () => {
        console.log(`node envirnoment variable is ${process.env.NODE_ENV}`);
        console.log(`listening to port ${envirnoment.port}`);
    });
}

//handle request response
app.handleReqRes = handleReqRes;

//create the server
app.createServer();