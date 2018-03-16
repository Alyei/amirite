import React from 'react';
import { Button, Grid, Row, Col } from 'react-bootstrap';

import QuestionBox from '../components/QuestionBox';
import AnswerBox from '../components/AnswerBox';

export default class Millionaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questionId: '',
      question: '',
      pictureId: '',
      options: [],
      timeLimit: 0,
      difficulty: null,
      questionTime: '',
      selectedOptionId: '',
      joker: [],
      playerState: 0,
      playerScore: 0,
      playerData: null,
      socket: this.props.socket,
    };
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
  //#region Joker
  //#region Audience
  handleAudienceReq() {}
  handleAudienceRes() {}
  handleAudienceClue() {}
  //#endregion Audience
  //#region FiftyFifty
  handleFiftyReq() {}
  handleFiftyRes() {}
  //#endregion FiftyFifty
  //#region Call
  handleCallReq() {}
  handleCallRes() {}
  handleWhomToCallReq() {}
  handleCallClue() {}

  //#endregion Call
  //#endregion Joker
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
  printJokers(jkr) {
    const Jokers = jkr.map(function(item, i) {
      return <Button key={item} id={item} />;
    });
    return Jokers;
  }

  render() {
    switch (this.state.playerState) {
      case 0:
        return this.props.location.host === true ? (
          <Button onClick={this.handleStartGameClick}>Start Game</Button>
        ) : null;
      case 1:
        return (
          <Grid className="MillionaireGrid" fluid>
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
              <Col xs={2} className="Jokers" />
            </Row>
          </Grid>
        );
      default:
        return null;
    }
  }
  //#endregion Display
}
