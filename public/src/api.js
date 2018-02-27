import io from 'socket.io-client';
import PropTypes from 'prop-types';

export var socket = null;

export function Connect(gamemodeToConnect) {
  return new Promise((resolve, reject) => {
    try {
      socket = io.connect(
        'https://localhost:443/' + gamemodeToConnect.toLowerCase()
      );

      socket.PropTypes = {
        MessageType: PropTypes.oneOf(Object.keys(MessageTypes)),
        GameMode: PropTypes.oneOf(Object.keys(GameModes)),
      };
      socket.MessageType = MessageTypes;
      socket.GameMode = GameModes;
      resolve(socket);
    } catch (err) {
      reject(err);
    }
  });
}

const MessageTypes = {
  //general
  PlayerInputError: '100',
  SpectatingData: '101',

  //QuestionQ
  QuestionQQuestion: '1',
  QuestionQTipFeedback: '2',
  QuestionQPlayerData: '3',
  QuestionQTip: '4',
  QuestionQGameData: '5',
  QuestionQHostArguments: '6',

  //Determination
  DeterminationQuestion: '10',
  DeterminationTipFeedback: '11',
  DeterminationPlayerData: '12',
  DeterminationTip: '13',
  DeterminationGameData: '14',
  DeterminationHostArguments: '15',

  //Millionaire
  MillionaireSpectateData: '20',
  MillionaireQuestion: '21',
  MillionaireTip: '22',
  MillionaireTipFeedback: '23',
  MillionaireAudienceJokerRequest: '24',
  MillionaireAudienceJokerResponse: '25',
  MillionaireAudienceJokerClue: '26',
  MillionairePassRequest: '27',
  MillionairePassResponse: '28',
};
const GameModes = {
  QuestionQ: '0',
  Determination: '1',
  Millionaire: '2',
};

export function closeSocket() {
  socket.off();
  socket.close();
}
/*
function startGame(username) {
    console.log("sending host game");
    //socket.off('gameid');
}
function sendAnswer(questionId, answer) {
    console.log("sending Answer");

    //socket.off('feedback');
}

export function sendTimeout(questionId, username) {
    socket.emit('timeout', {questionId, username});
    socket.on('feedback', function(feedback) {
        return feedback;
    });
    socket.off('feedback');
}

function redirectHost(gameid){
    return (<Redirect to='/game/${gameid}'/>)
}
*/
