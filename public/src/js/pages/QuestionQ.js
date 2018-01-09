import React from "react";

import QuestionBox from "../components/QuestionBox";
import AnswerBox from "../components/AnswerBox";

export default class QuestionQ extends React.Component {
    constructor() {
        super();
        this.state = {
            questionid: "",
            questiontext: "",
            answers: [],
            picture: null,
            currAnswer: 0,
        }
    }
    handleCurrAnswAdd() {
        this.setState({currAnswer: this.state.currAnswer+1});        
    }

    newQuestion() {
        return(
            <div>
            <QuestionBox text={this.state.questiontext} />
            </div>
        );
    }
    nextAnswer() {
        return(
            <div>
            <AnswerBox text={this.state.answers[this.state.currAnswer]} />
            </div>
        );
    }

    handleNoClick() {
        
    }
    handleYesClick() {

    }

    render() {
        return(
            <div>
            <newQuestion/>
            <nextAnswer/>
            <handleCurrAnswAdd/>
            </div>
        )
    }
}