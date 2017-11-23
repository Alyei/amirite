import * as mongo from "mongoose";
import { userSchema } from "./userSchema";

let userModel: any = mongo.model("user", userSchema);

export { userModel };
