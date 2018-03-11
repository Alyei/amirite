"use strict";
exports.__esModule = true;
var bcrypt = require("bcrypt");
var crypto = require("crypto");
var logging_1 = require("./logging");
var fs_1 = require("fs");
var path_1 = require("path");
/**
 * Hashes the model's password and saves it to the database.
 * @function
 * @param {any} model - The usermodel that should be saved.
 */
var hashPwAndSave = function (model) {
    try {
        bcrypt.hash(model.password, 8, function (err, hash) {
            model.password = hash.toString("hex");
            model.save(function (err, user) {
                if (err) {
                    logging_1.logger.log("info", "Password for user %s could not be saved.", model.username);
                    return console.error(err);
                }
            });
        });
    }
    catch (err) {
        logging_1.logger.log("error", err);
    }
};
exports.hashPwAndSave = hashPwAndSave;
/**
 * Generates a random, 10 character long, id.
 * @returns The id.
 */
var generateId = function () {
    return crypto
        .randomBytes(Math.ceil(10 * 3 / 4))
        .toString("base64")
        .slice(0, 10)
        .replace(/\+/g, "3")
        .replace(/\//g, "x");
};
exports.generateId = generateId;
/**
 * Generates a random, 6 character long, game id.
 * @returns The game id.
 */
var generateGameId = function () {
    return crypto
        .randomBytes(Math.ceil(10 * 3 / 4))
        .toString("base64")
        .slice(0, 6)
        .replace(/\+/g, "3")
        .replace(/\//g, "x")
        .toUpperCase();
};
exports.generateGameId = generateGameId;
var settings = JSON.parse(fs_1.readFileSync(path_1.join(__dirname, "..", "..", "config.json")).toString());
exports.settings = settings;
