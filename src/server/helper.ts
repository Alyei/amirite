import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Mongoose } from "mongoose";
import { logger } from "./logging";
import * as iQuestion from "../models/iQuestion";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Hashes the model's password and saves it to the database.
 * @function
 * @param {any} model - The usermodel that should be saved.
 * @author Andrej Resanovic
 */
let hashPwAndSave = function(model: any): void {
  try {
    bcrypt.hash(model.password, 8, (err: any, hash: any) => {
      model.password = hash.toString("hex");
      model.save((err: any, user: any) => {
        if (err) {
          logger.log(
            "info",
            "Password for user %s could not be saved.",
            model.username
          );
          return console.error(err);
        }
      });
    });
  } catch (err) {
    logger.log("error", err);
  }
};

/**
 * Generates a random, 10 character long, id.
 * @returns The id.
 * @author Andrej Resanovic
 */
let generateId = function(): string {
  return crypto
    .randomBytes(Math.ceil(10 * 3 / 4))
    .toString("base64")
    .slice(0, 10)
    .replace(/\+/g, "3")
    .replace(/\//g, "x");
};

/**
 * Generates a random, 6 character long, game id.
 * @returns The game id.
 * @author Andrej Resanovic
 */
let generateGameId = function(): string {
  return crypto
    .randomBytes(Math.ceil(10 * 3 / 4))
    .toString("base64")
    .slice(0, 6)
    .replace(/\+/g, "3")
    .replace(/\//g, "x")
    .toUpperCase();
};

/**
 * Parses the settings file and exposes it for use.
 * @author Andrej Resanovic
 */
const settings = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "config.json")).toString()
);

export { hashPwAndSave, generateId, generateGameId, settings };
