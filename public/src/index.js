import React from "react";
import { render } from "react-dom";
import {BrowserRouter as Router} from "react-router-dom";

import routes from "./routes";


import "./css/style.css";

render(
  <Router routes={routes} />,
  document.getElementById("root")
);
