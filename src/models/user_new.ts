import * as mongo from "mongoose";
import * as scrypt from "scrypt";
import { config } from "../config/database";

export namespace models {
  export class User {
    private userId: string;
    private username: string;
    private password: string;
    private email: string;
    private emailConfirmed: string;
    private rooms: string[];
    private firstName?: string;
    private lastName?: string;
    private params: scrypt.paramsObject;

    cnnstructor() {
      this.params = scrypt.paramsSync(0.5);
    }

    public generateHash() {
      scrypt.kdf(this.password, this.params, (err: any, hash: any) => {
        if (err) throw new err();

        this.password = hash;
      });
    }
  }
}
