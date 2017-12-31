import * as scrypt from "scrypt";
import * as crypto from "crypto";
import { verifyKdf, verifyKdfSync } from "scrypt";
import { Mongoose } from "mongoose";

let params: scrypt.ParamsObject = scrypt.paramsSync(2);

/**
 * Hashes the model's password and saves it to the database.
 * @function
 * @param {any} model - The usermodel that should be saved.
 */
let hashPwAndSave = function(model: any): void {
  scrypt.kdf(model.password, params, (err: any, hash: any) => {
    model.password = hash.toString("hex");
    model.save((err: any, user: any) => {
      if (err) return console.error(err);
      console.log(`Saved user ${model.username}`);
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
 * Compares a given string and compares it to the hashed password in the database.
 * @function
 * @param {string} dbHash - The hash saved in the database.
 * @param {string} enteredPassword - The string you want to compare to the saved hash.
 * @returns True or False.
 */
let checkPassword = async function(dbHash: string, enteredPassword: string) {
  let isValid: Boolean = false;
  isValid = await verifyKdfSync(Buffer.from(dbHash, "hex"), enteredPassword);

  return isValid;
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
export { checkPassword };
export { generateGameId };
