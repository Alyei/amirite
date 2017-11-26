"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const helper_1 = require("../server/helper");
/*export class User {
  public schema: mongoose.Schema;

  constructor() {
    this.setupSchema();
    //mongoose.model("user", this.schema);
  }

  private setupSchema(): void {*/
let userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false,
        unique: true,
        match: /^[0-9a-z]{10}$/i,
        default: helper_1.UserData.generateUserId()
    },
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z0-9]+$/i
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        required: false,
        match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i
    },
    emailConfirmed: Date,
    created: {
        type: Date,
        required: false,
        default: Date.now()
    },
    rooms: Array,
    firstName: String,
    lastName: String
});
exports.userSchema = userSchema;
//# sourceMappingURL=userSchema.js.map