"use strict";
exports.__esModule = true;
var env = require("dotenv");
var express = require("express");
var server_1 = require("./src/server/server");
var fs = require("fs");
var mongo = require("mongoose");
var userauth = require("./src/server/usermanagement");
var path_1 = require("path");
var helper_1 = require("./src/server/helper");
env.config();
require("mongoose").Promise = require("bluebird");
var mongodb = mongo.connect("mongodb://localhost:27017/amirite", {
    useMongoClient: true
});
var pKey = fs
    .readFileSync(path_1.join(__dirname + helper_1.settings.server.tls_cert))
    .toString();
var cert = fs
    .readFileSync(path_1.join(__dirname + helper_1.settings.server.tls_key))
    .toString();
var creds = {
    key: pKey,
    cert: cert
};
var pass = new userauth.Authentication();
var serverano = new server_1.server(creds, pass.passport);
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express();
serverano.StartListening();
