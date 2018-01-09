import {BrowserRouter as Router, Route} from "react-router-dom";
import React from "react";

import NavBar from "./js/components/NavBar.js";
import HomePage from "./js/pages/HomePage";
import QuestionQ from "./js/pages/QuestionQ";
import HostGame from "./js/components/HostGame.js";

import {socket as Socket} from "./api";

export default class Routes extends React.Component {
    render() {
        return(
            <div>
            <NavBar />
            <Router component={NavBar}>
            <div>
                <Route path="/" exact={true} component={HomePage} />
                <Route path="/QuestionQ" component={HostGame} socket={Socket}/>
                <Route path="/games/:gameid" component={QuestionQ} />
            </div>
            </Router>
            </div>
        )
    }
}
