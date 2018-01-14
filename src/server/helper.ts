import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Mongoose } from "mongoose";
import { logger } from "./logging";

/**
 * Hashes the model's password and saves it to the database.
 * @function
 * @param {any} model - The usermodel that should be saved.
 */
let hashPwAndSave = function(model: any): void {
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
};

/**
 * Generates a random, 10 character long, user id.
 * @function
 * @returns The user id.
 */
let generateUserId = function(): string {
  return crypto
    .randomBytes(Math.ceil(10 * 3 / 4))
    .toString("base64")
    .slice(0, 10)
    .replace(/\+/g, "3")
    .replace(/\//g, "x");
};

/**
 * Generates a random, 6 character long, game id.
 * @function
 * @returns The game id.
 */
let generateGameId = function(): string {
  return crypto
    .randomBytes(Math.ceil(10 * 3 / 4))
    .toString("base64")
    .slice(0, 6)
    .replace(/\+/g, "3")
    .replace(/\//g, "x");
};

export { hashPwAndSave };
export { generateUserId };
export { generateGameId };
