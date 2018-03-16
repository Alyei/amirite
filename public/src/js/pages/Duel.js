import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Grid, Row, Col, Table, Modal } from 'react-bootstrap';

import QuestionBox from '../components/QuestionBox';
import AnswerBox from '../components/AnswerBox';
import GameTime from '../components/GameTime';
import GameEndScreen from '../components/GameEndScreen';
import '../../css/gamemodes.css';

export default class QuestionQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //QuestionParams
      questionId: '',
      question: '',
      pictureId: '',
      options: [],
      timeLimit: 0,
      difficulty: null,
      //StartGameData
      players: [],
      scoreMin: 0,
      scoreGoal: 0,
      choiceChoosingTime: 0,
      catdiffChoosingtime: 0,
      catMaxOptions: 0,
      diffMaxOptions: 0,
      //Internal
      selectedOptionId: '',
      playerScoring: [],
      makeChoice: false,
      choiceOptions: [],
      socket: this.props.socket,
      ready: false,
    };
    this.AnswClick = this.handleAnswerClick.bind(this);
    this.handleStartGameClick = this.handleStartGameClick.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
    this.setQuestion = this.setQuestion.bind(this);
    this.handlePlayerFinished = this.handlePlayerFinished.bind(this);
    this.handleGameFinished = this.handleGameFinished.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
    this.props.setSockets();
  }
  componentWillUnmount() {
    this.props.closeSockets(
      this.props.match.params.gameid,
      this.props.username
    );
    this.props.onRef(undefined);
  }
  //#region eventHandler
  //#region receives
  setParameters(jsonParams) {
    var params = JSON.parse(jsonParams);
    if (params.gameId === this.props.match.params.gameid) {
      this.setState({
        players: params.players,
        scoreMin: params.gameArguments.scoreMin,
        scoreGoal: params.gameArguments.scoreGoal,
        choiceChoosingTime: params.gameArguments.choosingTime1,
        catdiffChoosingtime: params.gameArguments.choosingTime2,
        catMaxOptions: params.gameArguments.maxCategoryChoiceRange,
        diffMaxOptions: params.gameArguments.maxDifficultyChoiceRange,
      });
    } else {
      throw new Error();
    }
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
      selectedOptionId: '',
    });
  }
  handleFeedback(jsonFeedback) {
    var feedback = JSON.parse(jsonFeedback);
    var tipFeedback = JSON.parse(feedback.tip);
    console.log(feedback);
    if (feedback !== undefined) {
      if (feedback.questionId === this.state.questionId) {
        if (tipFeedback.username === this.props.username) {
          if (tipFeedback.correct === true) {
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
          this.setState({ playerScoring: feedback.scoring });
        } else {
          console.log(
            'Received questionId:',
            feedback.questionId,
            ', but currently hosted question with id:',
            this.state.questionId
          );
        }
      } else {
        console.log(
          'Received username:',
          tipFeedback.username,
          'expected username:',
          this.props.username
        );
      }
    }
  }
  handleChoice(duelChoice) {
    this.setState({ makeChoice: true, choiceOptions: duelChoice.choiceChoice });
  }
  handleGameFinished(jsonGameData) {
    var gameData = JSON.parse(jsonGameData);
    this.EndScreen.handleGameFinished(gameData);
  }
  //#endregion receives
  handleReadyClick(event) {
    this.setState(
      { ready: !this.state.ready },
      this.state.socket.emit(
        'action',
        JSON.stringify({
          username: this.props.username,
          gameId: this.props.match.params.gameid,
          msgType: this.state.socket.MessageType.DuelSetReadyState,
          data: {
            ready: this.state.ready,
          },
        })
      )
    );
  }
  handleAnswerClick(event) {
    this.setState({ selectedOptionId: event.target.id });
    this.sendAnswer(this.state.questionId, event.target.id);
    console.log(this.refs[event.target.id]);
    this.ProgBar.stopProgress();
  }
  handleChoiceOverlayClose() {
    this.setState({ makeChoice: false });
  }
  sendAnswer(questionId, answerId) {
    this.state.socket.emit(
      'action',
      JSON.stringify({
        username: this.props.username,
        gameId: this.props.match.params.gameid,
        msgType: this.state.socket.MessageType.DuelTip,
        data: {
          questionId: questionId,
          answerId: answerId,
        },
      })
    );
  }
  handlePlayerFinished(jsonPlayerData) {
    var playerData = JSON.parse(jsonPlayerData);
    console.log(playerData);
    console.log(this.props);
    if (this.props.username === playerData.username) {
      this.setState({ playerData: playerData, playerState: playerData.state });
    } else {
      console.log('got wrong username', playerData);
    }
  }
  //#endregion eventHandler
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
                {firstCol}
              </Col>
              <Col className="ColAns" xs={4}>
                <AnswerBox
                  className="AnswerBox"
                  key={item[0]}
                  id={item[0]}
                  text={item[1]}
                  ref={item[0]}
                  onClick={this.AnswClick}
                />
              </Col>
            </Row>
          );
        }
      }.bind(this)
    );
    console.log(Answ);
    return Answ;
  }
  printChoiceModal(choiceOptions) {
    return (
      <Modal chow={this.state.makeChoice} onHide={this.props.overlayClose}>
        <Modal.Title>Choose next Question Criteria</Modal.Title>
        <Modal.Body>{choiceOptions}</Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleChoiceOverlayClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
  printScores(playerData) {
    const players = playerData.map(function(item, i) {
      console.log(item, i);
      return (
        <tr key={item.id}>
          <td>{i + 1}</td>
          <td>{item.id}</td>
          <td>{item.score}</td>
        </tr>
      );
    });
    return (
      <Table bordered key={'playerStats'}>
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>{players}</tbody>
      </Table>
    );
  }
  render() {
    switch (this.state.playerState) {
      case 0:
        return this.state.playerState === 0 ? (
          <Button onClick={this.handleReadyClick}>Ready</Button>
        ) : null;
      case 1:
        return (
          <Grid className="QuestionQGrid" fluid>
            <Row className="row">
              <Col xs={9}>
                <Row>
                  <Col xsOffset={2} xs={8}>
                    {this.printScores(this.state.playerScoring)}
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
                    starttime={this.state.questionTime}
                    timelimit={this.state.timeLimit}
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
