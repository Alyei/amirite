import React from 'react';
import { Grid, Row, Col, Table } from 'react-bootstrap';

import '../../css/gamemodes.css';

export default class GameEndScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      gameRunning: true,
      gameData: undefined,
    };

    this.printQuestions = this.printQuestions.bind(this);
    this.handleGameFinished = this.handleGameFinished.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  handleGameFinished(gameData) {
    this.setState({ gameData: gameData, gameRunning: false });
  }

  printLeaderboard(gameData) {
    console.log(gameData);
    if (gameData !== undefined) {
      const players = gameData.players.map(function(item, i) {
        console.log(item, i);
        return (
          <tr key={item.username}>
            <td>{i + 1}</td>
            <td>{item.username}</td>
            <td>{item.score}</td>
          </tr>
        );
      });
      return (
        <Table bordered key={'leaderBoard'}>
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
    } else {
      return <p>others are still playing</p>;
    }
  }
  printScore() {
    return <p>personal Score: {this.props.playerData.score}</p>;
  }
  printQuestions() {
    var answers;
    var tipAnswer;
    var correctAnswer;
    const questions = this.props.playerData.questions.map(
      function(item, i) {
        tipAnswer = this.props.playerData.tips[i].tip.answerId;
        correctAnswer = this.props.playerData.tips[i].feedback.correctAnswer;

        if (this.props.playerData.tips[i].feedback.correct) {
          answers = function() {
            var currAnsw = item[0].options.find(function(element) {
              return element[0] === correctAnswer;
            });
            return (
              <p
                style={{ color: 'green' }}
                id={item[0].questionId + currAnsw[0]}
              >
                {currAnsw[1]}
              </p>
            );
          };
        } else {
          answers = function() {
            var wrongAnsw = item[0].options.find(function(element) {
              return element[0] === tipAnswer;
            });
            var rightAnsw = item[0].options.find(function(element) {
              return element[0] === correctAnswer;
            });
            return (
              <div>
                <p
                  style={{ color: 'red' }}
                  id={item[0].questionId + wrongAnsw[0]}
                >
                  {wrongAnsw[1]}
                </p>
                <p
                  style={{ color: 'green' }}
                  id={item[0].questionId + rightAnsw[0]}
                >
                  {rightAnsw[1]}
                </p>
              </div>
            );
          };
        }

        return (
          <div key={item[0].questionId} id={item[0].questionId}>
            <h2>
              {i + 1}. {item[0].question}
            </h2>
            {answers()}
          </div>
        );
      }.bind(this)
    );

    return questions;
  }
  render() {
    return (
      <Grid className="GameEndScreenGrid" fluid>
        <Row className="GameEndRow" center="xs">
          <Col xsOffset={2} xs={8}>
            <Row center="xs">
              <Col xs={6}>
                <h1>Leaderboard</h1>
                {this.state.gameRunning ? (
                  <p>others are still playing</p>
                ) : (
                  this.printLeaderboard(this.state.gameData)
                )}
              </Col>
            </Row>
            <Row center="xs">
              <Col>{this.printScore()}</Col>
            </Row>
            <Row center="xs">
              <Col>{this.printQuestions()}</Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    );
  }
}
