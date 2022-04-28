/*
 * Title: 
 * Description: 
 * Author: Rajib Hossain
 * Date: 2022-04-28 12:47
*/

//dependencies 
const fs = require('fs');
const path = require('path');

const lib = {};

//base dir of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
    //open file for writing 
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            //convert data to string
            const stringData = JSON.stringify(data);

            //write data to file & close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if(!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if(!err3) {
                            callback(false);
                        }else {
                            callback('Error closing the new file!');
                        }
                    });
                }else {
                    callback('Error writing to new file!');
                }
            });
        }else {
            callback(err);
        }
    });
}

//read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    });
}

//update existing file
lib.update = (dir, file, data, callback) => {
    //file open
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            //converting data into string
            const stringData = JSON.stringify(data);

            //truncate the file
            fs.ftruncate(fileDescriptor, (err2) => {
                if(!err2) {
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if(!err3) {
                            //close the file
                            fs.close(fileDescriptor, (err4) => {
                                if(!err4) {
                                    callback(false);
                                }else {
                                    callback(err4);
                                }
                            });
                        }else {
                            callback(err3);
                        }
                    });
                }else {
                    callback(err);
                }
            });
        }
    });
}

//deleting existing file
lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if(!err) {
            callback(false);
        }else {
            callback(err);
        }
    });
}

module.exports = lib;