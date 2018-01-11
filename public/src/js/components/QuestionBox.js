import React from "react";


export default class QuestionBox extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "",
            image: null,
        }
    }

    render() {
        return(
            <div>
                {this.state.image != null ? this.state.image : null}
                {this.state.text}
            </div>
        )
    }
}