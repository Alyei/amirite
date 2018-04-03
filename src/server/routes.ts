import * as path from "path";
import * as dotenv from "dotenv";
import { Editor } from "./QuestionEditor";
import { RunningGames } from "../game/RunningGames";

/**
 * HTTPS server's routing.
 * @class
 */
export class Https {
  private app: any;
  private passport: any;
  private questEdit: Editor;
  private sessions: RunningGames;

  /**
   * Sets up the routes.
   * @constructor
   * @param app Express server.
   * @param pass Passport object.
   */
  constructor(app: any, pass: any, questEdit: Editor, running: RunningGames) {
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
  private setRoutes(): void {
    //When the user visits '/' he should be sent .../public/index.html
    this.app.get("/", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "index.ejs"));
    });

    this.app.get("/login", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "login.ejs"), {
        message: req.flash("login")
      });
    });

    this.app.get("/signup", (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "signup.ejs"), {
        message: req.flash("login")
      });
    });

    this.app.get("/mhost", (req: any, res: any) => {
      res.render(
        path.join(__dirname, "..", "..", "public", "millionairehost.ejs")
      );
    });

    this.app.get("/mplayer", (req: any, res: any) => {
      res.render(
        path.join(__dirname, "..", "..", "public", "millionaireplayer.ejs")
      );
    });

    this.app.get("/api/signup", (req: any, res: any) => {
      res.render("signup");
    });

    this.app.get("/profile", this.IsAuthenticated, (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "profile.ejs"), {
        user: req.user
      });
    });

    this.app.get("/logout", this.IsAuthenticated, function(req: any, res: any) {
      req.logout();
      res.redirect("/");
    });

    this.app.get("/socket", this.IsAuthenticated, (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "socket.ejs"));
    });

    this.app.get("/question", this.IsAuthenticated, (req: any, res: any) => {
      res.render(path.join(__dirname, "..", "..", "public", "question.ejs"));
    });

    this.app.post(
      "/api/signup",
      this.passport.authenticate("local-signup"),
      (req: any, res: any) => {
        res.redirect("/login");
      }
    );

    this.app.post(
      "/signup",
      this.passport.authenticate("local-signup"),
      (req: any, res: any) => {
        res.redirect("/login");
      }
    );

    this.app.post(
      "/api/login",
      this.passport.authenticate("local-login"),
      (req: any, res: any) => {
        res.redirect("/socket");
      }
    );

    this.app.post(
      "/login",
      this.passport.authenticate("local-login"),
      (req: any, res: any) => {
        res.redirect("/socket");
      }
    );

    this.app.post("/api/questionupload", (req: any, res: any) => {
      this.questEdit
        .SaveQuestion(JSON.parse(req.body.data))
        .then((prom: any) => {
          res.status(200).JSON({
            success: true
          });
        })
        .catch((err: any) => {
          res.status(400).JSON({ success: false });
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

    this.app.post("/game", this.IsAuthenticated, (req: any, res: any) => {
      const msg = req.body.data;
      for (let game of this.sessions.Sessions) {
        if (game.generalArguments.gameId == msg.gameId) {
          res.send(game.generalArguments.gamemode);
        }
      }
    });

    this.app.post("/api/join", this.IsAuthenticated, (req: any, res: any) => {
      res.status(200).json({
        auth: "true"
      });
    });
  }

  private IsAuthenticated(req: any, res: any, next: any): any {
    if (req.user) {
      return next();
    } else {
      return res.status(401).json({
        auth: "false"
      });
    }
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
      res.redirect("https://" + req.headers.host + req.url);
    });
  }
}
