import * as path from "path";
import * as dotenv from "dotenv";

/**
 * Sets routes for the HTTPS server.
 */
export class Https {
  private app: any;
  private passport?: any;

  /**
   * Sets up the routes.
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
   */
  private setRoutes(): void {
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
        successRedirect: "/profile", // redirect to the secure profile section
        failureRedirect: "/signup", // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages  #IMPLEMENT
      })
    );

    this.app.post(
      "/login",
      this.passport.authenticate("local-login", {
        successRedirect: "/profile", // redirect to the secure profile section
        failureRedirect: "/login", // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages  #IMPLEMENT
      })
    );
  }
}

/**
 * Sets the redirect route for the HTTPS server,
 * to redirect from HTTP to HTTPS.
 */
export class Http {
  private app: any;
  private env: any;

  /**
   * Adds the route for redirection. * `app.get('*', ...)`
   * @param app HTTPS express app that should redirect.
   */
  constructor(app: any) {
    this.env = dotenv.config();
    this.app = app;
    this.httpRedirectRoute();
  }

  /**
   * Redirection route.
   */
  private httpRedirectRoute(): void {
    this.app.get("*", (req: any, res: any) => {
      res.redirect("https://localhost:" + process.env.https_port + req.url);
    });
  }
}
