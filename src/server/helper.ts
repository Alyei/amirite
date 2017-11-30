import * as scrypt from "scrypt";
import * as crypto from "crypto";
import { verifyKdf, verifyKdfSync } from "scrypt";

let params: scrypt.ParamsObject = scrypt.paramsSync(2);

let hashPwAndSave = function(model: any): void {
  scrypt.kdf(model.password, params, (err: any, hash: any) => {
    model.password = hash.toString("hex");
    model.save((err: any, user: any) => {
      if (err) return console.error(err);
      console.log(`Saved user ${model.username}`);
    });
  });
};

let generateUserId = function(): string {
  return crypto
    .randomBytes(Math.ceil(10 * 3 / 4))
    .toString("base64")
    .slice(0, 10)
    .replace(/\+/g, "3")
    .replace(/\//g, "x");
};

let checkPassword = async function(password: string, kdf: string) {
  let isValid: Boolean = false;
  isValid = await verifyKdfSync(Buffer.from(password, "hex"), kdf);

  return isValid;
};

export { hashPwAndSave };
export { generateUserId };
export { checkPassword };
