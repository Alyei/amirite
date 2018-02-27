import React from 'react';

export default class QuestionBox extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  static defaultProps = {
    questionid: '',
    text: '',
    pictureid: '',
  };
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }
  render() {
    const { onRef, ...other } = this.props;
    return (
      <div {...other}>
        {this.props.text}
        {this.props.image !== '' ? this.props.image : ''}
      </div>
    );
  }
}
