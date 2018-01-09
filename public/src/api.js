import React from "react";
import openSocket from "socket.io-client";
import {Redirect} from "react-router";

export const socket = openSocket('http://localhost:80');

export function startGame(username) {
    socket.emit('host game', username);
    socket.on('getGame',(gameid) => {<Redirect to='/games/${gameid}'/>})
    //socket.on('question',(questionJson) );

}