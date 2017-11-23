import * as pass from "passport";
import * as local from "passport-local";
import * as scrypt from "scrypt";
import { Passport } from "passport";
import { userModel } from "../models/initialization";
import { UserData } from "../server/helper";

export namespace UserManagement {
  export class Authentication {
    private SignupStrategy: local.Strategy;
    private User: any;
    public passport: any;

    constructor() {
      this.User = userModel;
      this.setupSerialization();
      this.SignupStrat();
      pass.use("local-signup", this.SignupStrategy);
      this.passport = pass;
    }

    private setupSerialization(): void {
      pass.serializeUser((user: any, done: any) => {
        done(null, user.id);
      });

      pass.deserializeUser((id: any, done: any) => {
        this.User.findById(id, (err: any, user: any) => {
          done(err, user);
        });
      });
    }

    private SignupStrat(): void {
      this.SignupStrategy = new local.Strategy(
        { passReqToCallback: true },
        (req: any, username: string, password: string, done: any) => {
          process.nextTick(() => {
            this.User.userModel.findOne(
              { username: username },
              (err: any, user: any) => {
                if (err) return done(err);

                if (user) {
                  return done(null, false /*,flash*/); //Add flash message
                } else {
                  let newUser: string = new this.User({
                    username: username,
                    password: password
                    //email: req.body.email
                  });

                  UserData.hashPwAndSave(newUser);
                }
              }
            );
          });
        }
      );
    }
  }
}
