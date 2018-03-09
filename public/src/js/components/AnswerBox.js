import React from 'react';

export default class AnswerBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibility: true,
    };
  }

  static defaultProps = {
    id: '',
    text: '',
  };

  render() {
    const { text, className, ...other } = this.props;
    return (
      <div
        onClick={this.props.onClick}
        {...other}
        className={this.props.className}
      >
        <div className="AnsBoxContent" {...other}>
          {this.props.text}
        </div>
      </div>
    );
  }
}
