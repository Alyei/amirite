import { BrowserRouter as Router, Route } from "react-router-dom";
import React from "react";

import NavBar from "./js/components/NavBar";
import HomePage from "./js/pages/HomePage";
import Determination from "./js/pages/Determination";
import HostGame from "./js/components/HostGame";
import QuestionQ from "./js/pages/QuestionQ";

import * as Socket from "./api";

export default class Routes extends React.Component {
    render() {
        console.log(Socket.socket.connected);
        console.log(Socket); 
        return(
            <Router component={NavBar}>
            <div>
                <Route path="/" exact component={HomePage} socketio={Socket}/>
                <Route path="/HostGame" component={() => <HostGame socketio={Socket}/>}/>
                <Route path="/game/:gameid" component={() => <QuestionQ socketio={Socket}/>} />
            </div>
            </Router>
        )
    }
}
