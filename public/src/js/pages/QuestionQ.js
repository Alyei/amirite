import React from "react";
import ReactDOM from "react-dom";
import {withRouter} from "react-router-dom";
import { Button } from "react-bootstrap";

import QuestionBox from "../components/QuestionBox";
import AnswerBox from "../components/AnswerBox";
import GameTimer from "../components/GameTime";
//import gStyle from "../../css/gamemodes.css";

class QuestionQ extends React.Component {
    constructor() {
        super();
        this.state = {
            questionId: "",
            question: "",
            pictureId: "",
            options: [],
            timeLimit: 0,
            difficulty: null,
            questionTime: null,
            username: "alyei",
            selectedOptionId: "",
            playerState: 0
        };
        this.AnswClick = this.handleAnswerClick.bind(this);
        //this.Timeout = this.handleTimeout.bind(this);
        this.handleStartGameClick = this.handleStartGameClick.bind(this);
        this.handleFeedback = this.handleFeedback.bind(this);
        this.setQuestion = this.setQuestion.bind(this);
    }

    componentDidMount() {
        this.props.socketio.socket.on('click', (msg) => function (msg) { 
            this.props.socketio.socket.emit("clack"); 
        }); 
        
        this.props.socketio.socket.on('1', this.setQuestion);
        this.props.socketio.socket.on('2', this.handleFeedback);
        if(this.props.location.host !== true)
        {
            this.handleJoinGame();
        }
    }
    componentWillUnmount() {
        this.props.socketio.socket.emit('leave game', 
            JSON.stringify({
                "gameid": this.props.match.params.gameid,
                "username": this.state.username
            })
        );
        this.props.socketio.socket.off('1');
        this.props.socketio.socket.off('2');
    }
    setQuestion(jsonQuestion)
    {
        var question = JSON.parse(jsonQuestion);
        console.log("new question", jsonQuestion);
        this.setState({
            questionId: question.questionId,
            question: question.question,
            pictureId: question.pictureId,
            options: question.options,
            timeLimit: question.timeLimit,
            difficulty: question.difficulty,
            questionTime: question.questionTime,
            selectedOptionId: ""
        });
    }
    handleFeedback(jsonFeedback) {
        var feedback = JSON.parse(jsonFeedback);
        console.log(feedback);
        if(feedback !== undefined)
        {
        if(feedback.questionId === this.state.questionId)
        {
            if(feedback.correct === true) {
                ReactDOM.findDOMNode(this.refs[this.state.selectedOptionId]).style.color = 'green';
            }
            else if(this.state.selectedOptionId !== ""){
                ReactDOM.findDOMNode(this.refs[this.state.selectedOptionId]).style.color = 'red';
                ReactDOM.findDOMNode(this.refs[feedback.correctAnswer]).style.color = 'green';
            }
            else {
                ReactDOM.findDOMNode(this.refs[feedback.correctAnswer]).style.color = 'green';
            }
            if(feedback.message === "too slow")
            {
                alert(feedback.message);
            }
        }
        else {
            console.log("Received questionId:",feedback.questionId,", but currently hosted question with id:",this.state.questionId);
        }
        }
    }
    handleJoinGame() {
        console.log("join game");
        this.props.socketio.socket.emit('join game', 
            JSON.stringify({
                "gameId": this.props.match.params.gameid, 
                "username": this.state.username
            })
        );
    }
    handleStartGameClick(event) {
        console.log("start game", this.props);
        this.props.socketio.socket.emit('start game', 
            JSON.stringify({
                "gameId": this.props.match.params.gameid, 
                "username": this.state.username
            })
        );
        this.setState({playerState: 1});
    }
    handleAnswerClick(event) {
        this.setState({selectedOptionId: event.target.id});
        this.sendAnswer(this.state.questionId,event.target.id);
        console.log(this.refs[event.target.id]);
    }/*
    handleTimeout() {
        this.sendAnswer(this.state.questionId,0);
    }*/
    sendAnswer(questionId,answerId) {
        this.props.socketio.socket.emit('action',
            JSON.stringify({
                "username": this.state.username,
                "gameId": this.props.match.params.gameid,
                "msgType": 4,
                "data": {
                    "questionId": questionId,
                    "answerId": answerId
                }  
            })    
        );
    }

    printAnswers(answ) {
        const Answ = answ.map(function (item, i){
            return (
                <AnswerBox className="AnswerBox" key={item[0]} id={item[0]} text={item[1]} ref={item[0]}
                onClick={this.AnswClick} />
             );
        }.bind(this)); 
        return(
            <div>
                {Answ}
            </div>
        ); 
    }

    render() {
        return(
            <div>
            <QuestionBox ref={(question) => this.Question = question} id={this.state.questionId} text={this.state.question} pictureId={this.state.pictureId}/>
            {this.printAnswers(this.state.options)}
            {this.state.playerState === 1 ? <GameTimer startTime={this.state.questionTime} timeLimit={this.state.timeLimit}/>: null}
            {this.props.location.host === true && this.state.playerState === 0 ? <Button onClick={this.handleStartGameClick}>Start Game</Button>: null}
            </div>
        )
    }
}

export default withRouter(QuestionQ);
