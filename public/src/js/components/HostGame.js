import React from 'react';
import { Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import * as Socket from '../../api';

class HostGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gamemodes: ['QuestionQ', 'Determination'],
      selectedMode: '',
      username: 'alyei', //change to cookies
      socket: null,
    };
    this.handleGameSelection = this.handleGameSelection.bind(this);
    this.handleHostGameClick = this.handleHostGameClick.bind(this);
    this.renderGamemodes = this.renderGamemodes.bind(this);
  }
  componentWillMount() {
    const params = new URLSearchParams(this.props.location.search);
    this.setState({ username: params.get('username') });
  }
  handleGameSelection(event) {
    this.setState({ selectedMode: event.target.value });
  }
  handleHostGameClick() {
    console.log(this.props);
    Socket.Connect(this.state.selectedMode)
      .then((sock) => {
        console.log(sock);
        this.setState({ socket: sock });
        console.log(this.state.username);
        this.state.socket.emit('host game', this.state.username);
        this.state.socket.on('gameid', (gameid) => {
          console.log('got game with id', gameid);
          console.log(this.state.socket);
          this.props.history.push({
            pathname: '/game/' + gameid + '?username=' + this.state.username,
            host: true,
            socketio: this.state.socket,
          });
        });
      })
      .catch((err) => {
        console.log('ERROR OCCURED', err);
      });
  }
  renderGamemodes() {
    return this.state.gamemodes.map(
      function(element) {
        return (
          <label key={element}>
            <input
              ref={element}
              type="radio"
              value={element}
              checked={this.state.selectedMode === element}
              onClick={this.handleGameSelection}
            />
            {element}
          </label>
        );
      }.bind(this)
    );
  }

  render() {
    return (
      <div className="HostGame">
        {this.renderGamemodes()}
        <Button onClick={this.handleHostGameClick}>Host Game</Button>
      </div>
    );
  }
}

export default withRouter(HostGame);
