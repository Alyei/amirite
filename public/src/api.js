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

  // QuestionQ
  QuestionQQuestion: '1',
  QuestionQTipFeedback: '2',
  QuestionQPlayerDataAndExplanations: '3',
  QuestionQTip: '4',
  QuestionQGameData: '5',
  QuestionQHostArguments: '6',
  QuestionQStartGameData: '7',

  // Determination
  DeterminationQuestion: '10',
  DeterminationTipFeedback: '11',
  DeterminationPlayerData: '12',
  DeterminationTip: '13',
  DeterminationGameDataForPlayers: '14',
  DeterminationHostArguments: '15',
  DeterminationGameDataForHost: '16',
  DeterminationPlayerStatistic: '17',

  //Millionaire
  MillionaireQuestion: '20', //
  MillionaireTip: '21',
  MillionaireTipFeedback: '22', //
  MillionaireAudienceJokerRequest: '23', //Player send; Sepct recv
  MillionaireAudienceJokerResponse: '24', //
  MillionaireAudienceJokerClue: '25', //Player recv; Spect send
  MillionaireAudienceJokerClueFeedback: '26', //Spect
  MillionaireFiftyFiftyJokerRequest: '27',
  MillionaireFiftyFiftyJokerResponse: '28', //
  MillionaireCallJokerRequest: '29', //Player send; Spect recv
  MillionaireCallJokerResponse: '30', //
  MillionaireCallJokerCallRequest: '31',
  MillionaireCallJokerClue: '32', //Player recv; Spect send
  MillionaireChooseMillionaireRequest: '33', //Admin recv
  MillionaireChooseMillionaireResponse: '34',
  MillionaireChooseQuestionRequest: '35', //Admin recv
  MillionaireChooseQuestionResponse: '36',
  MillionairePassRequest: '37',
  MillinairePassResponse: '38',
  MillionaireGameData: '39',
  MillionairePlayerData: '40',
  MillionaireActionFeedback: '41',

  // Duel
  DuelQuestion: '50', //
  DuelTip: '51',
  DuelTipFeedback: '52', //
  DuelStartGameData: '53', //
  DuelEndGameData: '54', //
  DuelChoiceRequest: '55', //
  DuelChoiceReply: '56',
  DuelChooseDifficultyRequest: '57', //
  DuelChooseDifficultyReply: '58',
  DuelChooseCategoryRequest: '59', //
  DuelChooseCategoryReply: '60',
  DuelSetReadyState: '61',
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
