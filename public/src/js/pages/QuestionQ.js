import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Grid, Row, Col } from 'react-bootstrap';

import QuestionBox from '../components/QuestionBox';
import AnswerBox from '../components/AnswerBox';
import GameTime from '../components/GameTime';
import GameEndScreen from '../components/GameEndScreen';
import '../../css/gamemodes.css';

export default class QuestionQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questionId: '12345',
      question: 'Question',
      pictureId: '',
      options: [['A', 'ansA'], ['B', 'ansB'], ['C', 'ansC'], ['D', 'ansD']],
      timeLimit: 180000,
      difficulty: null,
      questionTime: '2018-02-15T20:53:27.576Z',
      selectedOptionId: '',
      playerState: 1,
      playerScore: 0,
      playerData: null,
      socket: this.props.socket,
    };
    this.AnswClick = this.handleAnswerClick.bind(this);
    this.handleStartGameClick = this.handleStartGameClick.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
    this.setQuestion = this.setQuestion.bind(this);
    //this.setSockets = this.props.setSockets.bind(this);
    //this.closeSockets = this.props.closeSockets.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
    this.props.setSockets();
  }
  componentWillUnmount() {
    //leave game
    this.props.closeSockets(
      this.props.match.params.gameid,
      this.props.username
    );
    this.props.onRef(undefined);
  }

  setQuestion(jsonQuestion) {
    if (this.state.playerState === 0) {
      this.setState({ playerState: 1 });
    }
    var question = JSON.parse(jsonQuestion);
    console.log('new question', jsonQuestion);
    this.setState({
      questionId: question.questionId,
      question: question.question,
      pictureId: question.pictureId,
      options: question.options,
      timeLimit: question.timeLimit,
      difficulty: question.difficulty,
      questionTime: question.questionTime,
      selectedOptionId: '',
    });
  }
  handleFeedback(jsonFeedback) {
    var feedback = JSON.parse(jsonFeedback);
    console.log(feedback);
    if (feedback !== undefined) {
      if (feedback.questionId === this.state.questionId) {
        if (feedback.correct === true) {
          ReactDOM.findDOMNode(
            this.refs[this.state.selectedOptionId]
          ).style.backgroundcolor =
            'green';
        } else if (this.state.selectedOptionId !== '') {
          ReactDOM.findDOMNode(
            this.refs[this.state.selectedOptionId]
          ).style.backgroundcolor =
            'red';
          ReactDOM.findDOMNode(
            this.refs[feedback.correctAnswer]
          ).style.backgroundcolor =
            'green';
        } else {
          ReactDOM.findDOMNode(
            this.refs[feedback.correctAnswer]
          ).style.backgroundcolor =
            'green';
        }
        if (feedback.message === 'too slow') {
          alert(feedback.message);
        }
        this.setState({ playerScore: feedback.score });
      } else {
        console.log(
          'Received questionId:',
          feedback.questionId,
          ', but currently hosted question with id:',
          this.state.questionId
        );
      }
    }
  }
  handleStartGameClick(event) {
    console.log('start game', this.props);
    this.state.socket.emit(
      'start game',
      JSON.stringify({
        gameId: this.props.match.params.gameid,
        username: this.props.username,
      })
    );
    this.setState({ playerState: 1 });
  }
  handleAnswerClick(event) {
    this.setState({ selectedOptionId: event.target.id });
    this.sendAnswer(this.state.questionId, event.target.id);
    console.log(this.refs[event.target.id]);
    this.ProgBar.stopProgress();
  }
  sendAnswer(questionId, answerId) {
    this.state.socket.emit(
      'action',
      JSON.stringify({
        username: this.props.username,
        gameId: this.props.match.params.gameid,
        msgType: this.state.socket.MessageType.QuestionQTip,
        data: {
          questionId: questionId,
          answerId: answerId,
        },
      })
    );
  }
  handlePlayerFinished(jsonPlayerData) {
    var playerData = JSON.parse(jsonPlayerData);
    if (this.props.username === playerData.username) {
      this.setState({ playerData: playerData, playerState: playerData.state });
    } else {
      console.log('got wrong username', playerData);
    }
  }
  handleGameFinished(jsonGameData) {
    var gameData = JSON.parse(jsonGameData);
    this.EndScreen.printLeaderboard(gameData);
  }
  //#region Display
  printQuestion(questionId) {
    if (questionId !== '') {
      return (
        <Row center="xs">
          <Col xsOffset={2} xs={8}>
            <QuestionBox
              className="QuestionBox"
              onRef={(question) => (this.Question = question)}
              id={this.state.questionId}
              text={this.state.question}
              pictureid={this.state.pictureId}
            />
          </Col>
        </Row>
      );
    } else {
      return null;
    }
  }
  printAnswers(answ) {
    var j = 0;
    var firstCol;
    const Answ = answ.map(
      function(item, i) {
        if (j === 0) {
          firstCol = (
            <AnswerBox
              className="AnswerBox"
              key={item[0]}
              id={item[0]}
              text={item[1]}
              ref={item[0]}
              onClick={this.AnswClick}
            />
          );
          j = j + 1;
          return <div key={'d' + item[0]} />;
        } else {
          j = 0;
          return (
            <Row key={'r' + item[0]}>
              <Col className="ColAns" xsOffset={2} xs={4}>
                <div className="AnsBox">{firstCol}</div>
              </Col>
              <Col className="ColAns" xs={4}>
                <div className="AnsBox">
                  <AnswerBox
                    className="AnswerBox"
                    key={item[0]}
                    id={item[0]}
                    text={item[1]}
                    ref={item[0]}
                    onClick={this.AnswClick}
                  />
                </div>
              </Col>
            </Row>
          );
        }
      }.bind(this)
    );
    console.log(Answ);
    return Answ;
  }

  render() {
    switch (this.state.playerState) {
      case 0:
        return this.props.location.host === true ? (
          <Button onClick={this.handleStartGameClick}>Start Game</Button>
        ) : null;
      case 1:
        return (
          <Grid className="QuestionQGrid" fluid>
            <Row className="row">
              <Col xs={9}>
                <Row>
                  <Col xsOffset={2} xs={8}>
                    <p className="Score">
                      Score:
                      {this.state.playerScore}
                    </p>
                  </Col>
                </Row>
                {this.printQuestion(this.state.questionId)}
                {this.printAnswers(this.state.options)}
              </Col>
              <Col xs={2} className="GameTimeCol">
                {this.state.playerState === 1 ? (
                  <GameTime
                    className="GameTime"
                    onRef={(pBar) => (this.ProgBar = pBar)}
                    startTime={this.state.questionTime}
                    timeLimit={this.state.timeLimit}
                  />
                ) : null}
              </Col>
            </Row>
          </Grid>
        );
      case 3:
        return (
          <GameEndScreen
            playerData={this.state.playerData}
            onRef={(end) => (this.EndScreen = end)}
          />
        );
      default:
        return null;
    }
  }
  //#endregion Display
}
