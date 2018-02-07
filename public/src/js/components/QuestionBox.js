import React from "react";


export default class QuestionBox extends React.Component {
    constructor() {
        super();
        this.state = {
        }
    }
    static defaultProps = {
        questionid: "",
        text: "",
        pictureId: ""
    }

    render() {
        return(
            <div>
                {this.props.text}
                {this.props.image != "" ? this.props.image : ""}
            </div>
        )
    }
}