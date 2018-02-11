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
            selectedOptionId: ""
        };
        this.AnswClick = this.handleAnswerClick.bind(this);
        //this.Timeout = this.handleTimeout.bind(this);
        this.handleStartGameClick = this.handleStartGameClick.bind(this);

    }

    componentDidMount() {
        this.props.socketio.socket.on('QuestionQQuestion', function(jsonQuestion) {
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
        });
        this.props.socketio.socket.on('QuestionQTipFeedback', function(jsonFeedback) {
            var feedback = JSON.parse(jsonFeedback);
            if(feedback.questionId === this.state.questionId)
            {
                if(feedback.correct === true) {
                    ReactDOM.findDOMNode(this.refs[this.state.selectedOptionId]).style.color = 'green';
                }
                else {
                    ReactDOM.findDOMNode(this.refs[this.state.selectedOptionId]).style.color = 'red';
                }
                if(feedback.message === "too slow")
                {
                    alert(feedback.message);
                }
            }
            else {
                console.log("Received questionId:",feedback.questionId,", but currently hosted question with id:",this.state.questionId);
            }
        });
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
        this.props.socketio.socket.off('QuestionQQuestion');
        this.props.socketio.socket.off('QuestionQTipFeedback');
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
    }
  componentWillUnmount() {
    this.props.socketio.socket.emit("leave game", 
    JSON.stringify({
        "gameid": this.props.match.params.gameid,
        "username": this.state.username
    })
);
    this.props.socketio.socket.off("feedback");
  }
  handleJoinGame() {
    console.log("join game");
    this.props.socketio.socket.emit("join game", 
        JSON.stringify({
            "gameid": this.props.match.params.gameid,
            "username": this.state.username
        })
    );
  }
  sendAnswer(questionId, answerId) {
    this.props.socketio.socket.emit("tip", { questionId, answerId });
  }

    handleAnswerClick(event) {
        this.setState({selectedOptionId: event.target.id});
        this.sendAnswer(this.state.questionId,event.target.id);
        console.log(this.refs[event.target.id]);
        ReactDOM.findDOMNode(this.refs[event.target.id]).style.color = 'green';
        console.log(ReactDOM.findDOMNode(this.refs[event.target.id]).style.color)
        //console.log(window.getComputedStyle(ReactDOM.findDOMNode(this.refs[event.target.id]).color));
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
        var j = 0;
        const Answ = answ.map(function (item, i){
            return (
                <AnswerBox className="AnswerBox" key={item[0]} id={item[0]} text={item[1]} ref={item[0]}
                onClick={this.AnswClick} />
             );
             j = j+1;
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
            <GameTimer timeLimit={this.state.timeLimit}/>
            {this.props.location.host === true ? <Button onClick={this.handleStartGameClick}>Start Game</Button>: null}
            </div>
        )
    }
}

export default withRouter(QuestionQ);
