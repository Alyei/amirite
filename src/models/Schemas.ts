import * as mongoose from "mongoose";
import { generateId } from "../server/helper";
import { Schema } from "inspector";

/**
 * The mongoose-schema of the userobject for the database.
 */
let userSchema: mongoose.Schema = new mongoose.Schema({
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

let Question: mongoose.Schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9a-z]{10}$/i
  },
  difficulty: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  otherOptions: [
    {
      type: [String],
      required: true
    }
  ],
  explanation: {
    type: String,
    required: true
  }
});

const QuestionModel: any = mongoose.model("question", Question);

let UserModel: any = mongoose.model("user", userSchema);

/**
 * @returns The usermodel.
 */
export { UserModel, QuestionModel };
