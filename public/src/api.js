import React from "react";
import io from "socket.io-client";
import {Redirect} from "react-router";
import PropTypes from "prop-types";


export const socket = io.connect('https://localhost:443/questionq');

const MessageTypes = {
    PlayerInputError: "PlayerInputError",
    QuestionQQuestion: "QuestionQQuestion",
    QuestionQTipFeedback: "QuestionQTipFeedback",
    QuestionQPlayerData: "QuestionQPlayerData",
    QuestionQTip: "QuestionQTip",
    QuestionQGameData: "QuestionQGameData",
    QuestionQHostArguments: "QuestionQHostArguments",
    DeterminationPlayerData: "DeterminationPlayerData",
    DeterminationQuestion: "DeterminationQuestion",
    DeterminationTip: "DeterminationTip",
    DeterminationOption: "DeterminationOption",
    DeterminationTipFeedback: "DeterminationTipFeedback",
    MillionaireSpectateData: "MillionaireSpectateData",
    MillionaireQuestion: "MillionaireQuestion",
    MillionaireTip: "MillionaireTip",
    MillionaireTipFeedback: "MillionaireTipFeedback",
    MillionaireAudienceJokerRequest: "MillionaireAudienceJokerRequest",
    MillionaireAudienceJokerResponse: "MillionaireAudienceJokerResponse",
    MillionaireAudienceJokerClue: "MillionaireAudienceJokerClue",
    MillionairePassRequest: "MillionairePassRequest",
    MillionairePassResponse: "MillionairePassResponse"
}
socket.PropTypes = {
    MessageType: PropTypes.oneOf(Object.keys(MessageTypes))
}

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