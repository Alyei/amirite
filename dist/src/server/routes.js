"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dotenv = require("dotenv");
/**
 * Route-setting library for amirite.
 */
var ExpressRoutes;
(function (ExpressRoutes) {
    /**
     * Sets routes for the HTTPS server.
     */
    class Https {
        /**
         * Sets up the routes.
         * @param app Express server.
         * @param pass Passport object.
         */
        constructor(app, pass) {
            this.app = app;
            this.passport = pass;
            this.setRoutes();
        }
        /**
         * Sets the express server's routes.
         */
        setRoutes() {
            this.app.get("/", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
            });
            this.app.get("/login", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "..", "public", "login.html"));
            });
            this.app.get("/signup", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "..", "public", "signup.html"));
            });
            this.app.post("/signup", this.passport.authenticate("local-signup", {
                successRedirect: "/profile",
                failureRedirect: "/signup",
                failureFlash: false // allow flash messages  #IMPLEMENT
            }));
        }
    }
    ExpressRoutes.Https = Https;
    /**
     * Sets the redirect route for the HTTPS server,
     * to redirect from HTTP to HTTPS.
     */
    class Http {
        /**
         * Adds the route for redirection. * `app.get('*', ...)`
         * @param app HTTPS express app that should redirect.
         */
        constructor(app) {
            this.env = dotenv.config();
            this.app = app;
            this.httpRedirectRoute();
        }
        /**
         * Redirection route.
         */
        httpRedirectRoute() {
            this.app.get("*", (req, res) => {
                res.redirect("https://localhost:" + process.env.https_port + req.url);
            });
        }
    }
    ExpressRoutes.Http = Http;
})(ExpressRoutes = exports.ExpressRoutes || (exports.ExpressRoutes = {}));
//# sourceMappingURL=routes.js.map