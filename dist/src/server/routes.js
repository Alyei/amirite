"use strict";
exports.__esModule = true;
var path = require("path");
var dotenv = require("dotenv");
/**
 * HTTPS server's routing.
 * @class
 */
var Https = /** @class */ (function () {
    /**
     * Sets up the routes.
     * @constructor
     * @param app Express server.
     * @param pass Passport object.
     */
    function Https(app, pass, questEdit, running) {
        this.app = app;
        this.passport = pass;
        this.questEdit = questEdit;
        this.sessions = running;
        this.setRoutes();
    }
    /**
     * Sets the express server's routes.
     * @function
     */
    Https.prototype.setRoutes = function () {
        var _this = this;
        //When the user visits '/' he should be sent .../public/index.html
        this.app.get("/", function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "index.ejs"));
        });
        this.app.get("/login", function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "login.ejs"), {
                message: req.flash("login")
            });
        });
        this.app.get("/signup", function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "signup.ejs"), {
                message: req.flash("login")
            });
        });
        this.app.get("/mhost", function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "millionairehost.ejs"));
        });
        this.app.get("/mplayer", function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "millionaireplayer.ejs"));
        });
        this.app.get("/api/signup", function (req, res) {
            res.render("signup");
        });
        this.app.get("/profile", this.IsAuthenticated, function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "profile.ejs"), {
                user: req.user
            });
        });
        this.app.get("/logout", this.IsAuthenticated, function (req, res) {
            req.logout();
            res.redirect("/");
        });
        this.app.get("/socket", this.IsAuthenticated, function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "socket.ejs"));
        });
        this.app.get("/question", this.IsAuthenticated, function (req, res) {
            res.render(path.join(__dirname, "..", "..", "public", "question.ejs"));
        });
        this.app.post("/api/signup", this.passport.authenticate("local-signup"), function (req, res) {
            res.redirect("/login");
        });
        this.app.post("/signup", this.passport.authenticate("local-signup"), function (req, res) {
            res.redirect("/login");
        });
        /*this.app.post("/api/signup", (req: any, res: any) => {
          console.log("THIS COMING IN");
          console.log(req.body);
          console.log("_______________________________________");
          console.log(req.body.data);
          res.send("successful");
        });*/
        /*this.passport.authenticate("local-signup", {
          successRedirect: "/profile", //Redirect to the secure profile section.
          failureRedirect: "/signup", //Redirect back to the signup page if there is an error.
          failureFlash: true //Allow flash messages.
          });*/
        this.app.post("/api/login", this.passport.authenticate("local-login"), function (req, res) {
            res.redirect("/socket");
        });
        this.app.post("/login", this.passport.authenticate("local-login"), function (req, res) {
            res.redirect("/socket");
        });
        this.app.post("/question", function (req, res) {
            _this.questEdit
                .SaveQuestion(JSON.parse(req.body.data))
                .then(function (prom) {
                res.send("successful");
            })["catch"](function (err) {
                //implement statuscode
                res.send("failed");
            });
        });
        this.app.post("/test", function (req, res) {
            console.log(req.body.data);
            res.send("test");
        });
        this.app.post("/api/test", function (req, res) {
            console.log(req.body.data + "API");
            res.send("test");
        });
        this.app.post("/test", function (req, res) {
            console.log(req.body.data);
            res.send("test");
        });
        this.app.post("/api/test", function (req, res) {
            console.log(req.body.data + "API");
            res.send("test");
        });
        this.app.post("/game", this.IsAuthenticated, function (req, res) {
            var msg = req.body.data;
            for (var _i = 0, _a = _this.sessions.Sessions; _i < _a.length; _i++) {
                var game = _a[_i];
                if (game.GeneralArguments.gameId == msg.gameId) {
                    res.send(game.GeneralArguments.gamemode);
                }
            }
        });
    };
    Https.prototype.IsAuthenticated = function (req, res, next) {
        if (req.user) {
            return next();
        }
        else {
            return res.status(401).json({
                error: "not authenticated"
            });
        }
    };
    return Https;
}());
exports.Https = Https;
/**
 * Sets the http-to-https redirection routes.
 * @class
 */
var Http = /** @class */ (function () {
    /**
     * Adds the route for redirection.  `app.get('*', ...)`
     * @param app HTTPS express app that should redirect.
     * @constructor
     */
    function Http(app) {
        this.env = dotenv.config();
        this.app = app;
        this.httpRedirectRoute();
    }
    /**
     * Redirection route.
     * @function
     */
    Http.prototype.httpRedirectRoute = function () {
        this.app.get("*", function (req, res) {
            res.redirect("https://" + req.headers.host + req.url);
        });
    };
    return Http;
}());
exports.Http = Http;
