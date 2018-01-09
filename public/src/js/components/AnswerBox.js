import React from "react";

export default class AnswerBox extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "",
            visibility: 1,
        }
    }

    render() {
        return(
            <div>
                {this.state.text}
            </div>
        )
    }
}