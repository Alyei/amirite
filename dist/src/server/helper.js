"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scrypt = require("scrypt");
const crypto = require("crypto");
class UserData {
    static hashPwAndSave(model) {
        scrypt.kdf(model.password, this.params, (err, hash) => {
            model.password = hash.toString("hex");
            model.save((err, user) => {
                if (err)
                    return console.error(err);
                console.log("saved user");
            });
        });
    }
    static generateUserId() {
        return crypto
            .randomBytes(Math.ceil(10 * 3 / 4))
            .toString("base64")
            .slice(0, 10)
            .replace(/\+/g, "3")
            .replace(/\//g, "x");
    }
}
UserData.params = scrypt.paramsSync(2);
exports.UserData = UserData;
//# sourceMappingURL=helper.js.map