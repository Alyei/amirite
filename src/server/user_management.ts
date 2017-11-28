import * as pass from "passport";
import * as local from "passport-local";
import * as scrypt from "scrypt";
import { Passport } from "passport";
import { model } from "../models/userSchema";
import { UserData } from "../server/helper";

export namespace UserManagement {
  export class Authentication {
    private SignupStrategy: local.Strategy;
    public passport: any;

    constructor() {
      this.passport = new pass.Passport();
      this.setupSerialization();
      this.SignupStrat();
      this.passport.use("local-signup", this.SignupStrategy);
    }

    private setupSerialization(): void {
      this.passport.serializeUser((user: any, done: any) => {
        done(null, user.id);
      });

      this.passport.deserializeUser((id: any, done: any) => {
        model.findById(id, (err: any, user: any) => {
          done(err, user);
        });
      });
    }

    private SignupStrat(): void {
      this.SignupStrategy = new local.Strategy(
        { passReqToCallback: true },
        (req: any, username: string, password: string, done: any) => {
          process.nextTick(() => {
            model.findOne({ username: username }, (err: any, user: any) => {
              if (err) return done(err);

              if (user) {
                return done(null, false /*,flash*/); //Add flash message
              } else {
                let newUser: string = new model({
                  username: username,
                  password: password
                  //email: req.body.email
                });

                UserData.hashPwAndSave(newUser);
              }
            });
          });
        }
      );
    }
  }
}
