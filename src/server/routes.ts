import * as path from "path";
import * as dotenv from "dotenv";

/**
 * HTTPS server's routing.
 * @class
 */
export class Https {
  private app: any;
  private passport?: any;

  /**
   * Sets up the routes.
   * @constructor
   * @param app Express server.
   * @param pass Passport object.
   */
  constructor(app: any, pass?: any) {
    this.app = app;
    this.passport = pass;
    this.setRoutes();
  }

  /**
   * Sets the express server's routes.
   * @function
   */
  private setRoutes(): void {
    //When the user visits '/' he should be sent .../public/index.html
    this.app.get("/", (req: any, res: any) => {
      res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
    });

    this.app.get("/login", (req: any, res: any) => {
      res.sendFile(path.join(__dirname, "..", "..", "public", "login.html"));
    });

    this.app.get("/signup", (req: any, res: any) => {
      res.sendFile(path.join(__dirname, "..", "..", "public", "signup.html"));
    });

    this.app.post(
      "/signup",
      this.passport.authenticate("local-signup", {
        successRedirect: "/profile", //Redirect to the secure profile section.
        failureRedirect: "/signup", //Redirect back to the signup page if there is an error.
        failureFlash: true //Allow flash messages.
      })
    );

    this.app.post(
      "/login",
      this.passport.authenticate("local-login", {
        successRedirect: "/profile", //Redirect to the secure profile section.
        failureRedirect: "/login", //Redirect back to the signup page if there is an error.
        failureFlash: true //Allow flash messages.
      })
    );
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
      res.redirect("https://localhost:" + process.env.https_port + req.url);
    });
  }
}
