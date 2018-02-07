import React from "react";
import { withRouter } from "react-router-dom";

import QuestionBox from "../components/QuestionBox";
import AnswerBox from "../components/AnswerBox";
import GameTimer from "../components/GameTime";

export class QuestionQ extends React.Component {
  constructor() {
    super();
    this.state = {
      questionId: "",
      question: "",
      pictureId: "",
      options: [["a", "answer"]],
      timeLimit: 10,
      difficulty: null,
      questionTime: null,
      username: "thatName"
    };
    this.AnswClick = this.handleAnswerClick.bind(this);
    this.Timeout = this.handleTimeout.bind(this);
  }
  componentDidMount() {
    this.props.socketio.socket.on("feedback", function(feedback) {
      console.log(feedback);
    });
    console.log();
    if (this.props.location.host !== true) {
      this.handleJoinGame();
    }
  }
  componentWillUnmount() {
    this.props.socketio.socket.emit("leave game", {
      gameid: this.props.match.params.gameid,
      username: this.state.username
    });
    this.props.socketio.socket.off("feedback");
  }
  handleJoinGame() {
    console.log("join game");
    this.props.socketio.socket.emit("join game", {
      gameid: this.props.match.params.gameid,
      username: this.state.username
    });
  }
  sendAnswer(questionId, answerId) {
    this.props.socketio.socket.emit("tip", { questionId, answerId });
  }

  handleAnswerClick(event) {
    this.sendAnswer(this.state.questionId, event.target.id);
  }

  handleTimeout() {
    this.sendAnswer(this.state.questionId, 0);
  }

  printAnswers(answ) {
    const Answ = answ.map(
      function(item, i) {
        return (
          <AnswerBox
            key={item[0]}
            id={item[0]}
            text={item[1]}
            onClick={this.AnswClick}
          />
        );
      }.bind(this)
    );
    return <div>{Answ}</div>;
  }

  render() {
    return (
      <div>
        <QuestionBox
          id={this.state.questionId}
          text={this.state.question}
          pictureId={this.state.pictureId}
        />
        {this.printAnswers(this.state.options)}
        <GameTimer onTimeOut={this.Timeout} timeLimit={this.state.timeLimit} />
      </div>
    );
  }
}

export default withRouter(QuestionQ);
