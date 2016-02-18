'use strict';

var fs = require('fs');
var https = require('https');
var path = require('path')
var privateKey  = fs.readFileSync(path.join(__dirname,'../key.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname,'../cert.pem'), 'utf8');

var credentials = {key: privateKey, cert: certificate};
// var express = require('express');
// var app = express();
var app = require('./app'),
	db = require('./db');
var port = 8080;
// your express configuration here

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(80);
httpsServer.listen(port,function () {
	console.log('HTTPS server patiently listening on port', port);
});









// var port = 8080;
// var server = app.listen(port, function () {
// 	console.log('HTTP server patiently listening on port', port);
// });

module.exports = httpsServer;