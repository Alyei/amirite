import * as mongoose from "mongoose";
import { generateUserId } from "../server/helper";

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

/*userSchema.methods.WriteStuff = function() {
  console.log("testerino");
};*/

let model: any = mongoose.model("user", userSchema);

export { model };
