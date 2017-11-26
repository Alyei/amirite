"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo = require("mongoose");
const userSchema_1 = require("./userSchema");
let userModel = mongo.model("user", userSchema_1.userSchema);
exports.userModel = userModel;
//# sourceMappingURL=initialization.js.map