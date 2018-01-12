import React from "react";
import io from "socket.io-client";
import {Redirect} from "react-router";


export const socket = io.connect('https://localhost:443/questionq');

export function closeSocket() {
    socket.off();
    socket.close();
}
/*
function startGame(username) {
    console.log("sending host game");
    //socket.off('gameid');
}
function sendAnswer(questionId, answer) {
    console.log("sending Answer");

    //socket.off('feedback');
}

export function sendTimeout(questionId, username) {
    socket.emit('timeout', {questionId, username});
    socket.on('feedback', function(feedback) {
        return feedback;
    });
    socket.off('feedback');
}

function redirectHost(gameid){
    return (<Redirect to='/game/${gameid}'/>)
}
*/