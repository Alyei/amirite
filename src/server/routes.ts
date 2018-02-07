import * as path from "path";
import * as dotenv from "dotenv";
import { Editor } from "./QuestionEditor";

/**
 * HTTPS server's routing.
 * @class
 */
export class Https {
  private app: any;
  private passport: any;
  private questEdit: Editor;

  /**
   * Sets up the routes.
   * @constructor
   * @param app Express server.
   * @param pass Passport object.
   */
  constructor(app: any, pass: any, questEdit: Editor) {
    this.app = app;
    this.passport = pass;
    this.questEdit = questEdit;
    this.setRoutes();
  }

  /**
   * Sets the express server's routes.
   * @function
   */
  private setRoutes(): void {
    //When the user visits '/' he should be sent .../public/index.html
    this.app.get("/", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "index.ejs"));
    });
    /*
    this.app.get("/login", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "login.ejs"), {
        message: req.flash("login")
      });
    });
*/
    this.app.get("/api/signup", (req: any, res: any) => {
      res.render("signup");
    });
    /*
    this.app.get("/profile", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "profile.ejs"), {
        user: req.user
      });
    });

    this.app.get("/logout", function(req: any, res: any) {
      req.logout();
      res.redirect("/");
    });
*/
    this.app.get("/socket", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "socket.ejs"));
    });

    this.app.get("/question", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "question.ejs"));
    });

    this.app.post(
      "/api/signup",
      this.passport.authenticate("local-signup", {
        successRedirect: "/profile", //Redirect to the secure profile section.
        failureRedirect: "/signup", //Redirect back to the signup page if there is an error.
        failureFlash: true //Allow flash messages.
      })
    );

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

    this.app.post(
      "/api/login",
      this.passport.authenticate("local-login", {
        successRedirect: "/profile", //Redirect to the secure profile section.
        failureRedirect: "/login", //Redirect back to the signup page if there is an error.
        failureFlash: true //Allow flash messages.
      })
    );

    this.app.post("/question", (req: any, res: any) => {
      this.questEdit
        .SaveQuestion(JSON.parse(req.body.data))
        .then((prom: any) => {
          res.send("successful");
        })
        .catch((err: any) => {
          //implement statuscode
          res.send("failed");
        });
    });

    this.app.post("/test", (req: any, res: any) => {
      console.log(req.body.data);

      res.send("test");
    });
    this.app.post("/api/test", (req: any, res: any) => {
      console.log(req.body.data + "API");

      res.send("test");
    });

    this.app.post("/test", (req: any, res: any) => {
      console.log(req.body.data);

      res.send("test");
    });
    this.app.post("/api/test", (req: any, res: any) => {
      console.log(req.body.data + "API");

      res.send("test");
    });
  }
}

/**
 * Sets the http-to-https redirection routes.
 * @class
 */
export class Http {
  private app: any;
  private env: any;

  /**
   * Adds the route for redirection.  `app.get('*', ...)`
   * @param app HTTPS express app that should redirect.
   * @constructor
   */
  constructor(app: any) {
    this.env = dotenv.config();
    this.app = app;
    this.httpRedirectRoute();
  }

  /**
   * Redirection route.
   * @function
   */

  private httpRedirectRoute(): void {
    this.app.get("*", (req: any, res: any) => {
      res.redirect("https://localhost:" + 443 + req.url);
    });
  }
}
