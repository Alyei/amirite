import React from "react";

import QuestionBox from "../components/QuestionBox";
import AnswerBox from "../components/AnswerBox";

export default class Determination extends React.Component {
    constructor() {
        super();
        this.state = {
            questionid: "",
            questiontext: "",
            answers: [],
            picture: null,
        }
    }

    handleAnswerClick() {
        
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
                answers.forEach(answer => {
                    <AnswerBox text={answer} />
                });
            </div>
        );
    }

    render() {
        return(
            <div>
            <newQuestion/>
            <nextAnswer/>
            </div>
        )
    }
}