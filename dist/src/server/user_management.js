"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pass = require("passport");
const local = require("passport-local");
const initialization_1 = require("../models/initialization");
const helper_1 = require("../server/helper");
var UserManagement;
(function (UserManagement) {
    class Authentication {
        constructor() {
            this.User = initialization_1.userModel;
            this.passport = new pass.Passport();
            this.setupSerialization();
            this.SignupStrat();
            this.passport.use("local-signup", this.SignupStrategy);
        }
        setupSerialization() {
            this.passport.serializeUser((user, done) => {
                done(null, user.id);
            });
            this.passport.deserializeUser((id, done) => {
                this.User.findById(id, (err, user) => {
                    done(err, user);
                });
            });
        }
        SignupStrat() {
            this.SignupStrategy = new local.Strategy({ passReqToCallback: true }, (req, username, password, done) => {
                process.nextTick(() => {
                    this.User.userModel.findOne({ username: username }, (err, user) => {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false /*,flash*/); //Add flash message
                        }
                        else {
                            let newUser = new this.User({
                                username: username,
                                password: password
                                //email: req.body.email
                            });
                            helper_1.UserData.hashPwAndSave(newUser);
                        }
                    });
                });
            });
        }
    }
    UserManagement.Authentication = Authentication;
})(UserManagement = exports.UserManagement || (exports.UserManagement = {}));
//# sourceMappingURL=user_management.js.map