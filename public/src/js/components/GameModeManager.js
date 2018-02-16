import React from 'react';

import Determination from '../pages/Determination';
import QuestionQ from '../pages/QuestionQ';
import * as Socket from '../../api';

export default class GameModeManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMode: '',
      socket: null,
      openSocketEvents: [],
      username: 'alyei',
    };
    //#region Binds
    this.getGameType = this.getGameType.bind(this);
    this.handleJoinGame = this.handleJoinGame.bind(this);
    this.setSockets = this.setSockets.bind(this);
    this.closeSockets = this.closeSockets.bind(this);
    this.newSocketEvent = this.newSocketEvent.bind(this);

    this.QuestionQConf = this.QuestionQConf.bind(this);
    this.setQuestionQSockets = this.setQuestionQSockets.bind(this);

    this.DeterminationConf = this.DeterminationConf.bind(this);
    this.setDeterminationSockets = this.setDeterminationSockets.bind(this);
    //#endregion Binds
  }
  //#region StartUp
  componentWillMount() {
    const params = new URLSearchParams(this.props.location.search);
    this.setState({ username: params.get('username') });

    this.getGameType(this.props).then((gamemode) => {
      console.log(gamemode);
      if (this.props.location.socketio !== undefined) {
        this.setState({ socket: this.props.location.socketio }, function() {
          this.setSockets();
          this.setState({ selectedMode: this.state.socket.nsp.substring(1) });
        });
        if (this.props.location.host !== true) {
          this.handleJoinGame();
        }
      } else {
        Socket.Connect(gamemode)
          .then((res) => {
            this.setState({ socket: res });
          })
          .then(() => {
            this.setSockets();
            this.setState({ selectedMode: gamemode });
            if (this.props.location.host !== true) {
              this.handleJoinGame();
            }
          });
      }
    });
  }
  async getGameType(props) {
    return await fetch('https://localhost:443/api/game', {
      method: 'POST',
      body: JSON.stringify({
        gameId: props.match.params.gameid,
      }),
    })
      .then((res) => {
        console.log(res);
        return res.json(); //change to res.json()
      })
      .catch((err) => console.log(err))
      .then((response) => {
        console.log(response);
        return response.gamemode;
      }); //change to response.gamemode
  }
  setSockets() {
    console.log(this.state.socket.MessageType.QuestionQQuestion);
    this.newSocketEvent(
      'click',
      () =>
        function() {
          this.state.socket.emit('clack');
        }
    );
  }

  handleJoinGame() {
    console.log('join game');
    this.state.socket.emit(
      'join game',
      JSON.stringify({
        gameId: this.props.match.params.gameid,
        username: this.state.username,
      })
    );
  }

  newSocketEvent(event, listener) {
    this.state.socket.on(event, listener);
    var newSocketEventArray = this.state.openSocketEvents.slice();
    newSocketEventArray.push(event);
    this.setState({ openSocketEvents: newSocketEventArray });
  }
  //#endregion StartUp
  //#region CloseDown
  closeSockets(gameid, username) {
    this.state.openSocketEvents.map(
      function(item, i) {
        this.state.socket.off(item);
      }.bind(this)
    );
    this.state.socket.emit(
      'leave game',
      JSON.stringify({
        gameid: gameid,
        username: username,
      })
    );
  }
  //#endregion CloseDown
  //#region QuestionQ
  QuestionQConf() {
    return (
      <QuestionQ
        onRef={(ref) => (this.QuestionQ = ref)}
        {...this.props}
        socket={this.state.socket}
        setSockets={this.setQuestionQSockets}
        closeSockets={this.closeSockets}
        username={this.state.username}
      />
    );
  }
  setQuestionQSockets() {
    this.newSocketEvent(
      this.state.socket.MessageType.QuestionQQuestion,
      this.QuestionQ.setQuestion
    );
    this.newSocketEvent(
      this.state.socket.MessageType.QuestionQTipFeedback,
      this.QuestionQ.handleFeedback
    );
    this.newSocketEvent(
      this.state.socket.MessageType.QuestionQPlayerData,
      this.QuestionQ.handlePlayerFinished
    );
    this.newSocketEvent(
      this.state.socket.MessageType.QuestionQGameData,
      this.QuestionQ.handleGameFinished
    );
  }
  //#endregion QuestionQ
  //#region Determination
  DeterminationConf() {
    return (
      <Determination
        onRef={(ref) => (this.Determination = ref)}
        {...this.props}
        socket={this.state.socket}
        setSockets={this.setDeterminationSockets}
        closeSockets={this.closeSockets}
        username={this.state.username}
      />
    );
  }
  setDeterminationSockets() {
    this.newSocketEvent(
      this.state.socket.MessageType.DeterminationQuestion,
      this.Determination.setQuestion
    );
    this.newSocketEvent(
      this.state.socket.MessageType.DeterminationTipFeedback,
      this.Determination.handleFeedback
    );
  }
  //#endregion Determination
  render() {
    switch (this.state.selectedMode) {
      case 'questionq':
        return this.QuestionQConf();
      case 'determination':
        return this.DeterminationConf();
      default:
        return <div>div</div>;
    }
  }
}
