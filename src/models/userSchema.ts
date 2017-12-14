import * as mongoose from "mongoose";
import { generateUserId } from "../server/helper";
import { Schema } from "inspector";

/**
 * The mongoose-schema of the userobject for the database.
 */
let userSchema: mongoose.Schema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    unique: true,
    match: /^[0-9a-z]{10}$/i,
    default: generateUserId()
  },
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z0-9]+$/i
  },
  password: {
    type: String,
    required: true
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

let model: any = mongoose.model("user", userSchema);

/**
 * @returns The usermodel.
 */
export { model };
