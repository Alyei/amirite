import React from 'react';
import { Button, Grid, Row, Col, Table } from 'react-bootstrap';

import '../../css/gamemodes.css';

export default class GameEndScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      gameRunning: true,
    };

    this.printQuestions = this.printQuestions.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  printLeaderboard(gameData) {
    if (gameData !== undefined) {
      const players = gameData.players.map(
        function(item, i) {
          return (
            <tr>
              <td>{i}</td>
              <td>{item[i - 1].username}</td>
              <td>{item[i - 1].score}</td>
            </tr>
          );
        }.bind(this)
      );
      return (
        <Table bordered>
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
    const questions = this.props.playerData.questions.map(
      function(item, i) {
        if (this.props.playerData.tips[i - 1].feedback.correct) {
          answers = function() {
            var currAnsw = item[0].options.find(function(element) {
              return (
                element[0] ===
                this.props.playerData.tips[i - 1].feedback.correctAnswer
              );
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
              return (
                element[0] === this.props.playerData.tips[i - 1].tip.answerId
              );
            });
            var rightAnsw = item[0].options.find(function(element) {
              return (
                element[0] ===
                this.props.playerData.tips[i - 1].feedback.correctAnswer
              );
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
              {i}. {item[0].question}
            </h2>
            <h3 id={'exp_' + item[0].questionId} />
            {answers()}
          </div>
        );
      }.bind(this)
    );

    return questions;
  }
  render() {
    return (
      <Grid className="GameEndScreenGrid">
        <Row center="xs">
          <Row>
            <Col xs={6}>
              <h1>Leaderboard</h1>
              {this.printLeaderboard()}
            </Col>
          </Row>
          <Row>
            <Col>{this.printScore()}</Col>
          </Row>
          <Row>
            <Col>{this.printQuestions()}</Col>
          </Row>
        </Row>
      </Grid>
    );
  }
}
