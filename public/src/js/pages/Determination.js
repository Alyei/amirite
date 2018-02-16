import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Label } from 'react-bootstrap';

import QuestionBox from '../components/QuestionBox';
import AnswerBox from '../components/AnswerBox';

export default class Determination extends React.Component {
  constructor() {
    super();
    this.state = {
      questionId: '',
      question: '',
      pictureId: '',
      timeLimit: 0,
      difficulty: null,
      currOption: [],
      username: 'alyei', //change to cookies
      playerState: 0,
      solved: this.props.socket,
      correctAnswer: '',
    };
    this.Solution = this.Solution.bind(this);
    this.handleAnswerClick = this.handleAnswerClick.bind(this);
  }
  componentDidMount() {
    this.props.onRef(this);
    this.setSockets();
  }
  componentWillUnmount() {
    this.props.closeSockets(
      this.props.match.params.gameid,
      this.props.username
    );
    this.props.onRef(undefined);
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

  setQuestion(jsonQuestion) {
    var question = JSON.parse(jsonQuestion);
    console.log('new question', jsonQuestion);
    this.setState(
      {
        questionId: question.questionId,
        question: question.question,
        pictureId: question.pictureId,
        timeLimit: question.timeLimit,
        difficulty: question.difficulty,
      },
      this.setOption(question.firstOption)
    );
  }
  handleFeedback(jsonFeedback) {
    var feedback = JSON.parse(jsonFeedback);
    console.log(feedback);
    if (feedback !== undefined) {
      if (feedback.questionId === this.state.questionId) {
        if (feedback.correct === true) {
          //ReactDOM.findDOMNode(this.refs[this.state.selectedOptionId]).style.color = 'green';
          this.setState({ selectedOptionId: '' });
          this.setOption(feedback.nextOption);
        } else if (this.state.selectedOptionId !== '') {
          ReactDOM.findDOMNode(
            this.refs[this.state.selectedOptionId]
          ).style.color =
            'red';
          this.setState({ correctAnswer: feedback.correctAnswer[1] });
        }
        if (feedback.message === 'too slow') {
          alert(feedback.message);
          this.setState(
            { correctAnswer: feedback.correctAnswer[1] },
            this.setState({ solved: true })
          );
        }
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
  setOption(receivedDeterminationOption) {
    this.setState(
      { currOption: receivedDeterminationOption },
      console.log('nextOption', receivedDeterminationOption)
    );
  }

  Solution() {
    return <Label>{this.state.correctAnswer}</Label>;
  }

  handleAnswerClick(event) {
    this.socket.emit(
      'action',
      JSON.stringify({
        username: this.state.username,
        gameId: this.props.match.params.gameid,
        msgType: this.socket.MessageType.DeterminationTip,
        data: {
          questionId: this.state.questionId,
          answerId: this.state.currOption[0],
          correct: [event.target.id] === 'Yes' ? true : false,
        },
      })
    );
    this.setState({ selectedOptionId: event.target.id });
  }

  render() {
    return (
      <div>
        <QuestionBox text={this.state.question} />
        {this.state.solved === true ? this.Solution() : null}
        <AnswerBox
          ref={this.state.currOption[0]}
          id={this.state.currOption[0]}
          text={this.state.currOption[1]}
        />
        <Button onClick={this.handleAnswerClick} id="Yes">
          Right
        </Button>
        <Button onClick={this.handleAnswerClick} id="No">
          Wrong
        </Button>
      </div>
    );
  }
}
