import React from "react";
import openSocket from "socket.io-client";
import {Redirect} from "react-router";

export const socket = openSocket('https://localhost:443');

export function startGame(username) {
    socket.emit('host game', username);
    socket.on('get game',(gameid) => {<Redirect to='/game/${gameid}'/>})
    //socket.on('question',(questionJson) );


}