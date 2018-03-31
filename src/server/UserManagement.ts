import * as pass from "passport";
import * as local from "passport-local";
import * as bcrypt from "bcrypt";
import { Passport } from "passport";
import { UserModel } from "../models/Schemas";
import * as helper from "../server/Helper";
import { logger } from "./Logging";

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
    logger.log("silly", "Setting up serialization");
    this.SignupStrat();
    logger.log("silly", "Setting up signup strategy");
    this.loginStrat();
    logger.log("silly", "Setting up login strategy");
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
      UserModel.findById(id, (err: any, user: any) => {
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
          UserModel.findOne({ username: username }, (err: any, user: any) => {
            if (err) return done(err);

            if (user) {
              logger.log("silly", "Submitted username already exists");
              return done(null, false);
            } else {
              const newUser: any = new UserModel({
                username: username,
                password: password,
                email: req.body.email
              });

              logger.log("silly", "Creating new user: %s", username);

              helper.hashPwAndSave(newUser);

              logger.log(
                "silly",
                "%s: Hashed password and saved in database.",
                username
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
        UserModel.findOne(
          { username: username },
          async (err: any, user: any) => {
            if (err) return done(err);

            if (!user) {
              //If the user doesn't exist
              console.log("User doesn't exist.");
              return done(
                null,
                false
              );
            }

            //Waits for the password check.
            bcrypt.compare(
              password,
              user.password,
              (err: any, same: boolean) => {
                if (same) {
                  logger.log("info", "User %s logged in.", user.username);
                  return done(null, user);
                } else {
                  logger.log(
                    "info",
                    "User %s entered a wrong password.",
                    user.username
                  );
                  return done(
                    null,
                    false,
                    req.flash("loginMessage", "Username or password is wrong.")
                  );
                }
              }
            );
          }
        );
      }
    );
  }
}
