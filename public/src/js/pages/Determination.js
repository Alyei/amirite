import React from "react";
import {Button, Label} from "react-bootstrap";

import QuestionBox from "../components/QuestionBox";
import AnswerBox from "../components/AnswerBox";

export default class Determination extends React.Component {
    constructor() {
        super();
        this.state = {
                question: {
                questionid: "",
                questiontext: "",
                answers: [],
                picture: null
            },
            currAnswer: 0,
            solved: false,
            explanation: ""
        }
    }
    handleCurrAnswAdd() {
        this.setState({currAnswer: this.state.currAnswer+1});        
    }

    newQuestion() {
        return(
            <div>
            <QuestionBox text={this.state.question.questiontext} />
            </div>
        );
    }
    nextAnswer() {
        return(
            <div>
            <AnswerBox text={this.state.question.answers[this.state.currAnswer]} />
            </div>
        );
    }
    Solution() {
        return(
            <Label>{this.explanation}</Label>
        )
    }

    handleAnswerClick(event) {
        feedback: this.props.socket.sendAnswer({
            tip: {
                question_id: this.state.question.questionid,
                answer: this.state.question.answers[this.state.currAnswer],
                given_answer: [event.target.name] == "Yes" ? true : false
            }
        });
        //{feedback.iscorrect == true ? }
    }

    render() {
        return(
            <div>
            <newQuestion/>
            {/*this.state.solved == true ? */}
            <nextAnswer name="displayedAnswer"/>
            <Button name="Yes">Right</Button>
            <Button name="No">Wrong</Button>
            <handleCurrAnswAdd/>
            </div>
        )
    }
}