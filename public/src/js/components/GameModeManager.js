import React from 'react';

import Determination from '../pages/Determination';
import QuestionQ from '../pages/QuestionQ';
import Duel from '../pages/Duel';
import Millionaire from '../pages/Millionaire';
import * as Socket from '../../api';

export default class GameModeManager extends React.Component {
  constructor(props) {
    super(props);
    //#region Instances
    this.state = {
      selectedMode: '',
      socket: null,
      openSocketEvents: [],
    };
    const sockMsgType = null;
    //#endregion Instances
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

    this.MillionaireConf = this.MillionaireConf.bind(this);
    this.setMillionaireSockets = this.setMillionaireSockets.bind(this);
    this.setMillionaireSpectatorSockets = this.setMillionaireSpectatorSockets.bind(
      this
    );

    this.DuelConf = this.DuelConf.bind(this);
    this.setDuelSockets = this.setDuelSockets.bind(this);
    //#endregion Binds
  }
  //#region StartUp
  componentWillMount() {
    this.getGameType(this.props).then((gamemode) => {
      console.log(gamemode);
      if (this.props.location.socketio !== undefined) {
        this.setState(
          { socket: this.props.location.socketio },
          (this.sockMsgType = this.state.socket.MessageType),
          function() {
            this.setSockets();
            this.setState({ selectedMode: this.state.socket.nsp.substring(1) });
          }
        );
        if (this.props.location.host !== true) {
          this.handleJoinGame();
        }
      } else {
        Socket.Connect(gamemode)
          .then((res) => {
            this.setState(
              { socket: res },
              (this.sockMsgType = this.state.socket.MessageType)
            );
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
    console.log(props.match.params.gameid);
    return await fetch('https://localhost:443/api/game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        data: {
          gameId: props.match.params.gameid,
        },
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
        username: this.props.username,
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
        username={this.props.username}
      />
    );
  }
  setQuestionQSockets() {
    this.newSocketEvent(
      this.sockMsgType.QuestionQQuestion,
      this.QuestionQ.setQuestion
    );
    this.newSocketEvent(
      this.sockMsgType.QuestionQTipFeedback,
      this.QuestionQ.handleFeedback
    );
    this.newSocketEvent(
      this.sockMsgType.QuestionQPlayerData,
      this.QuestionQ.handlePlayerFinished
    );
    this.newSocketEvent(
      this.sockMsgType.QuestionQGameData,
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
        username={this.props.username}
      />
    );
  }
  setDeterminationSockets() {
    this.newSocketEvent(
      this.sockMsgType.DeterminationQuestion,
      this.Determination.setQuestion
    );
    this.newSocketEvent(
      this.sockMsgType.DeterminationTipFeedback,
      this.Determination.handleFeedback
    );
    this.newSocketEvent(
      this.sockMsgType.DeterminationPlayerData,
      this.Determination.handlePlayerFinished
    );
    this.newSocketEvent(
      this.sockMsgType.DeterminationGameData,
      this.Determination.handleGameFinished
    );
  }
  //#endregion Determination
  //#region Duel
  DuelConf() {
    return (
      <Duel
        onRef={(ref) => (this.Duel = ref)}
        {...this.props}
        socket={this.state.socket}
        setSockets={this.setDuelSockets}
        closeSockets={this.closeSockets}
        username={this.props.username}
      />
    );
  }
  setDuelSockets() {
    this.newSocketEvent(this.sockMsgType.DuelQuestion, this.Duel.setQuestion);
    this.newSocketEvent(
      this.sockMsgType.DuelTipFeedback,
      this.Duel.handleFeedback
    );
    this.newSocketEvent(
      this.sockMsgType.DuelStartGameData,
      this.Duel.setParameters
    );
    this.newSocketEvent(
      this.sockMsgType.DuelChoiceRequest,
      this.Duel.handleChoice
    );
    this.newSocketEvent(
      this.sockMsgType.DuelChooseDifficultyRequest,
      this.Duel.handleDifficultyChoice
    );
    this.newSocketEvent(
      this.sockMsgType.DuelChooseCategoryRequest,
      this.Duel.handleCategoryChoice
    );
    this.newSocketEvent(
      this.sockMsgType.DuelEndGameData,
      this.Duel.handleGameFinished
    );
  }
  //#endregion Duel
  //#region Millionaire
  MillionaireConf() {
    return (
      <Millionaire
        onRef={(ref) => (this.Millionaire = ref)}
        {...this.props}
        socket={this.state.socket}
        setSockets={this.setMillionaireSockets}
        closeSockets={this.closeSockets}
        username={this.props.username}
      />
    );
  }
  setMillionaireSockets() {
    this.newSocketEvent(
      this.sockMsgType.MillionaireQuestion,
      this.Millionaire.setQuestion
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireTipFeedback,
      this.Millionaire.handleFeedback
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireAudienceJokerResponse,
      this.Millionaire.handleAudienceRes
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireAudienceJokerClue,
      this.Millionaire.handleAudienceClue
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireFiftyFiftyJokerResponse,
      this.Millionaire.handleFiftyRes
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireCallJokerResponse,
      this.Millionaire.handleCallRes
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireCallJokerClue,
      this.Millionaire.handleCallClue
    );
    this.newSocketEvent(
      this.sockMsgType.MillionairePlayerData,
      this.Millionaire.handlePlayerFinished
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireGameData,
      this.Millionaire.handleGameFinished
    );
  }

  setMillionaireSpectatorSockets() {
    this.newSocketEvent(
      this.sockMsgType.SpectatingData,
      this.Millionaire.handleGameFinished
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireCallJokerRequest,
      this.Millionaire.handleGameFinished
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireAudienceJokerRequest,
      this.Millionaire.handleGameFinished
    );
    this.newSocketEvent(
      this.sockMsgType.MillionaireGameData,
      this.Millionaire.handleGameFinished
    );
  }
  //#endregion Millionaire
  render() {
    switch (this.state.selectedMode) {
      case 'questionq':
        return this.QuestionQConf();
      case 'determination':
        return this.DeterminationConf();
      case 'duel':
        return this.DuelConf();
      case 'millionaire':
        return this.MillionaireConf();
      default:
        return <div>div</div>;
    }
  }
}
