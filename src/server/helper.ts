import * as scrypt from "scrypt";
import * as crypto from "crypto";

export class UserData {
  public static hashPwAndSave(
    model: any,
    paramsObject: scrypt.ParamsObject
  ): void {
    scrypt.kdf(model.password, paramsObject, (err: any, hash: any) => {
      model.password = hash.toString("hex");
      model.save((err: any, user: any) => {
        if (err) return console.error(err);
        console.log("saved user");
      });
    });
  }

  public static generateUserId() {
    return crypto
      .randomBytes(Math.ceil(10 * 3 / 4))
      .toString("base64")
      .slice(0, 10)
      .replace(/\+/g, "3")
      .replace(/\//g, "x");
  }
}
