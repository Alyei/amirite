import { BrowserRouter as Router, Route } from "react-router-dom";
import React from "react";

import NavBar from "./js/components/NavBar.js";
import HomePage from "./js/pages/HomePage";
import Determination from "./js/pages/Determination";
import HostGame from "./js/components/HostGame.js";

//import { socket as Socket } from "./api";

export default class Routes extends React.Component {
    render() {
        return(
            <Router component={NavBar}>
            <div>
                <Route path="/" exact component={HomePage} />
                <Route path="/HostGame" component={HostGame}/> {/*socket={Socket}/>*/}
                <Route path="/game/:gameid" component={Determination} />
            </div>
            </Router>
        )
    }
}
