import * as pass from "passport";
import * as local from "passport-local";
import * as scrypt from "scrypt";
import { Passport } from "passport";
import { model } from "../models/userSchema";
import * as helper from "../server/helper";

/**
 * Contains the various authentication/signup methods.
 * @class
 */
export class Authentication {
  private LoginStrategy: local.Strategy;
  private SignupStrategy: local.Strategy;
  public passport: any;

  /**
   * Initializes the Authentication class.
   * @constructor
   */
  constructor() {
    this.passport = new pass.Passport();
    this.setupSerialization();
    this.SignupStrat();
    this.loginStrat();
    this.passport.use("local-signup", this.SignupStrategy);
    this.passport.use("local-login", this.LoginStrategy);
  }

  /**
   * Sets up the serialization for passport.
   * @function
   */
  private setupSerialization(): void {
    //How to save user.
    this.passport.serializeUser((user: any, done: any) => {
      done(null, user.id);
    });

    //How to get user.
    this.passport.deserializeUser((id: any, done: any) => {
      model.findById(id, (err: any, user: any) => {
        done(err, user);
      });
    });
  }

  /**
   * Initializes the signup strategy for passport.
   * @function
   */
  private SignupStrat(): void {
    this.SignupStrategy = new local.Strategy(
      { passReqToCallback: true }, //True, so that the whole request can be accessed.
      (req: any, username: string, password: string, done: any) => {
        process.nextTick(() => {
          //So everything is there - copied from guide
          model.findOne({ username: username }, (err: any, user: any) => {
            //Looks for the model with the username in the database.
            if (err) return done(err);

            if (user) {
              return done(
                null,
                false,
                req.flash("signupMessage", "Username already taken")
              );
            } else {
              let newUser: any = new model({
                username: username,
                password: password,
                email: req.body.email
              });

              helper.hashPwAndSave(newUser);
              req.flash(
                "signupSuccessful",
                "The account was created successfully."
              );
            }
          });
        });
      }
    );
  }

  /**
   * Initializes the login strategy for passport.
   * @function
   */
  private loginStrat(): void {
    this.LoginStrategy = new local.Strategy(
      { passReqToCallback: true },
      (req: any, username: string, password: string, done: any) => {
        model.findOne({ username: username }, async (err: any, user: any) => {
          if (err) return done(err);

          if (!user)
            //If the user doesn't exist
            return done(
              null,
              false,
              req.flash("loginMessage", "Username or password is wrong.")
            );

          //Waits for the password check.
          let isPwValid: Boolean = await helper.checkPassword(
            user.password,
            password
          );

          if (!isPwValid) {
            console.log("wrong pw");
            return done(
              null,
              false,
              req.flash("loginMessage", "Username or password is wrong.")
            );
          }

          console.log("right pw"); //debugging
          return done(null, user);
        });
      }
    );
  }
}
