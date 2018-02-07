import React from "react";

export default class AnswerBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibility: true
        }
    }

    static defaultProps = {
        id: "",
        text: ""
    }

    render() {
        const {text, ...other} = this.props;
        return(
            <div onClick={this.props.onClick} {...other}>
                {this.props.text}
            </div>
        )
    }
}