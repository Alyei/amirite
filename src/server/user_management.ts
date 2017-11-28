import * as pass from "passport";
import * as local from "passport-local";
import * as scrypt from "scrypt";
import { Passport } from "passport";
import { model } from "../models/userSchema";
import { UserData } from "../server/helper";

/**
 * Class for the various authentication Methods.
 */
export class Authentication {
  private LoginStrategy: local.Strategy;
  private SignupStrategy: local.Strategy;
  public passport: any;

  constructor() {
    this.passport = new pass.Passport();
    this.setupSerialization();
    this.SignupStrat();
    this.loginStrat();
    this.passport.use("local-signup", this.SignupStrategy);
    this.passport.use("local-login", this.LoginStrategy);
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
              return done(
                null,
                false,
                req.flash("signupMessage", "Already taken")
              );
            } else {
              let newUser: string = new model({
                username: username,
                password: password,
                email: req.body.email
              });

              UserData.hashPwAndSave(newUser);
            }
          });
        });
      }
    );
  }

  private loginStrat(): void {
    this.LoginStrategy = new local.Strategy(
      { passReqToCallback: true },
      (req: any, username: string, password: string, done: any) => {
        model.findOne({ username: username }, (err: any, user: any) => {
          if (err) return done(err);

          if (!user)
            return done(
              null,
              false,
              req.flash("loginMessage", "No user found.")
            );

          if (!user.validPassword(password))
            return done(
              null,
              false,
              req.flash("loginMessage", "Wrong password.")
            );

          return done(null, user);
        });
      }
    );
  }
}
