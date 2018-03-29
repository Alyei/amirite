//#region enums
//#region general
/**
 * The MessageType-enum contains every type of data that is sent from or to the gameserver during a game.
 * @value 100: PlayerInputError - the message-type for data according to the iPlayerInputError-interface (server -> client)
 * @value 101: SpectatingData - the message-type for data according to the iSpectatingData-interface (server -> client)
 * @value 102: ChangePlayerRolesRequest - the message-type for data according to the iChangePlayerRoleRequest-interface (client -> server)
 * @value 1: QuestionQQuestion - the message-type for data according to the iQuestionQQuestion-interface (server -> client)
 * @value 2: QuestionQTipFeedback - the message-type for data according to the iQuestionQTipFeedback-interface (server -> client)
 * @value 3: QuestionQPlayerDataAndExplanations - the message-type for data according to the iQuestionQPlayerDataAndExplanations-interface (server -> client)
 * @value 4: QuestionQTip - the message-type for data according to the iQuestionQTip-interface (client -> server)
 * @value 5: QuestionQGameData - the message-type for data according to the iQuestionQSaveGameData-interface (server -> client)
 * @value 6: QuestionQHostArguments - the message-type for data according to the iQuestionQHostArguments-interface (client -> server -> client)
 * @value 7: QuestionQStartGameData - the message-type for data according to the iQuestionQStartGameData-interface (server -> client)
 * @value 8: QuestionQEndGameData - the message-type for data according to the iQuestionQGameData-interface (server -> client)
 * @value 9: QuestionQPlayerStatistic - the message-type for data according to the iQuestionQPlayerStatistic-interface (server -> client)
 * @value 10: DeterminationQuestion - the message-type for data according to the iDeterminationQuestion-interface (server -> client)
 * @value 11: DeterminationTipFeedback - the message-type for data according to the iDeterminationTipFeedback-interface (server -> client)
 * @value 12: DeterminationPlayerData - the message-type for data according to the iDeterminationPlayerData-interface (server -> client)
 * @value 13: DeterminationTip - the message-type for data according to the iDeterminationTip-interface (client -> server)
 * @value 14: DeterminationGameDataForPlayers - the message-type for data according to the iDeterminationEndGameData-interface (server -> client)
 * @value 15: DeterminationHostArguments - the message-type for data according to the iDeterminationHostArguments-interface
 * @value 16: DeterminationGameDataForHost - the message-type for data according to the iDeterminationGameData-interface (server -> client)
 * @value 17: DeterminationPlayerStatistic - the message-type for data according to the iDeterminationPlayerStatistic-interface (server -> client)
 * @value 18: DeterminationStartGameData - the message-type for data according to the iDeterminationStartGameData-interface (server -> client)
 * @value 20: MillionaireQuestion - the message-type for data according to the iMillionairePlayerQuestion-interface (server -> client)
 * @value 21: MillionaireTip - the message-type for data according to the iMillionaireTip-interface (client -> server)
 * @value 22: MillionaireTipFeedback - the message-type for data according to the iMillionaireTipFeedback-interface (server -> client)
 * @value 23: MillionaireAudienceJokerRequest - the message-type for data according to the iMillionaireAudienceJokerRequest-interface (client -> server)
 * @value 24: MillionaireAudienceJokerResponse - the message-type for data according to the iMillionaireAudienceJokerResponse-interface (server -> client)
 * @value 25: MillionaireAudienceJokerClue - the message-type for data according to the iMillionaireAudienceJokerPlayerClue-interface (client -> server -> client)
 * @value 26: MillionaireAudienceJokerClueFeedback - the message-type for data according to the iMillionaireAudienceJokerPlayerClueData-interface (server -> client)
 * @value 27: MillionaireFiftyFiftyJokerRequest - the message-type for data according to the iMillionaireFiftyFiftyJokerRequest-interface (client -> server)
 * @value 28: MillionaireFiftyFiftyJokerResponse - the message-type for data according to the iMillionaireFiftyFiftyJokerResponse-interface (server -> client)
 * @value 29: MillionaireCallJokerRequest - the message-type for data according to the iMillionaireCallJokerRequest-interface (client -> server)
 * @value 30: MillionaireCallJokerResponse - the message-type for data according to the iMillionaireCallJokerResponse-interface (server -> client)
 * @value 31: MillionaireCallJokerCallRequest - the message-type for data according to the iMillionaireCallJokerCallRequest-interface and when sent to the client it indicates that the receiving client is called (client -> server -> client)
 * @value 32: MillionaireCallJokerClue - the message-type for data according to the iMillionaireCallJokerClue-interface (client -> server -> client)
 * @value 33: MillionaireChooseMillionaireRequest - the message-type for data according to the iMillionaireChooseMillionaireRequest-interface (server -> client)
 * @value 34: MillionaireChooseMillionaireResponse - the message-type for data according to the iMillionaireChooseMillionaireResponse-interface (client -> server)
 * @value 35: MillionaireChooseQuestionRequest - the message-type for data according to the iMillionaireChooseQuestionRequest-interface (server -> client)
 * @value 36: MillionaireChooseQuestionResponse - the message-type for data according to the iMillionaireChooseQuestionResponse-interface (client -> server)
 * @value 37: MillionairePassRequest - the message-type for data according to the iMillionairePassRequest-interface (client -> server)
 * @value 38: MillinairePassResponse - this message-type is not used
 * @value 39: MillionaireGameData - the message-type for data according to the iMillionaireGameData-interface (server -> client)
 * @value 40: MillionairePlayerData - the message-type for data according to the iMillionairePlayerData-interface (server -> client)
 * @value 41: MillionaireActionFeedback - the message-type for data according to the iMillionaireActionFeedback-interface (server -> client)
 * @value 41: MillionaireAddQuestionsRequest - the message-type for data according to the MillionaireAddQuestionsRequest-interface (client -> server)
 * @value 41: MillionaireAddQuestionsResponse - the message-type for data according to the MillionaireAddQuestionsResponse-interface (server -> client)
 * @value 50: DuelQuestion - the message-type for data according to the iDuelQuestion-interface (server -> client)
 * @value 51: DuelTip - the message-type for data according to the iDuelTip-interface (client -> server)
 * @value 52: DuelTipFeedback - the message-type for data according to the iDuelTipFeedback-interface (server -> client)
 * @value 53: DuelStartGameData - the message-type for data according to the iDuelStartGameData-interface (server -> client)
 * @value 54: DuelEndGameData - the message-type for data according to the iDuelEndGameData-interface (server -> client)
 * @value 55: DuelChoiceRequest - the message-type for data according to the iDuelChooseChoiceRequest-interface (server -> client)
 * @value 56: DuelChoiceReply - the message-type for data according to the iDuelChooseChoiceReply-interface (client -> server)
 * @value 57: DuelChooseDifficultyRequest - the message-type for data according to the iDuelChooseDifficultyRequest-interface (server -> client)
 * @value 58: DuelChooseDifficultyReply - the message-type for data according to the iDuelChooseDifficultyReply-interface (client -> server)
 * @value 59: DuelChooseCategoryRequest - the message-type for data according to the iDuelChooseCategoryRequest-interface (server -> client)
 * @value 60: DuelChooseCategoryReply - the message-type for data according to the iDuelChooseCategoryReply-interface (client -> server)
 * @value 61: DuelSetReadyState - the message-type for data according to the iDuelSetReadyState-interface (client -> server)
 * @value 62: DuelPlayerData - the message-type for data according to the iDuelPlayerData-interface (server -> client)
 */
export enum MessageType {
  // general
  PlayerInputError = 100,
  SpectatingData,
  ChangePlayerRolesRequest,

  // QuestionQ
  QuestionQQuestion = 1,
  QuestionQTipFeedback,
  QuestionQPlayerDataAndExplanations,
  QuestionQTip,
  QuestionQGameData,
  QuestionQHostArguments,
  QuestionQStartGameData,
  QuestionQEndGameData,
  QuestionQPlayerStatistic,

  // Determination
  DeterminationQuestion = 10,
  DeterminationTipFeedback,
  DeterminationPlayerData,
  DeterminationTip,
  DeterminationGameDataForPlayers,
  DeterminationHostArguments,
  DeterminationGameDataForHost,
  DeterminationPlayerStatistic,
  DeterminationStartGameData,

  // Millionaire
  MillionaireQuestion = 20,
  MillionaireTip,
  MillionaireTipFeedback,
  MillionaireAudienceJokerRequest,
  MillionaireAudienceJokerResponse,
  MillionaireAudienceJokerClue,
  MillionaireAudienceJokerClueFeedback,
  MillionaireFiftyFiftyJokerRequest,
  MillionaireFiftyFiftyJokerResponse,
  MillionaireCallJokerRequest,
  MillionaireCallJokerResponse,
  MillionaireCallJokerCallRequest,
  MillionaireCallJokerClue,
  MillionaireChooseMillionaireRequest,
  MillionaireChooseMillionaireResponse,
  MillionaireChooseQuestionRequest,
  MillionaireChooseQuestionResponse,
  MillionairePassRequest,
  MillinairePassResponse,
  MillionaireGameData,
  MillionairePlayerData,
  MillionaireActionFeedback,
  MillionaireAddQuestionsRequest,
  MillionaireAddQuestionsResponse,

  // Duel
  DuelQuestion = 50,
  DuelTip,
  DuelTipFeedback,
  DuelStartGameData,
  DuelEndGameData,
  DuelChoiceRequest,
  DuelChoiceReply,
  DuelChooseDifficultyRequest,
  DuelChooseDifficultyReply,
  DuelChooseCategoryRequest,
  DuelChooseCategoryReply,
  DuelSetReadyState,
<<<<<<< HEAD
  DuelPlayerData
=======
  DuelPlayerData,
>>>>>>> gs_commentary
}

/**
 * The GameAction-enum contains every game-action that can be performed a game.
 * @value 0: Start - start the game
 * @value 0: Stop - stops the game (removed)
 * @value 0: Pause - pauses the game (removed)
 * @value 0: Save - saves a game (removed)
 * @value 0: Load - loads a game (removed)
 */
export enum GameAction {
  Start = 0,
  Stop,
  Pause,
  Save,
  Load
}

/**
 * The Gamemode-enum contains every amirite-gamemode.
 * @value 0: QuestionQ - the QuestionQ-gamemode
 * @value 1: Determination - the Determination-gamemode
 * @value 2: Millionaire - the Millionaire-gamemode
 * @value 3: Duel - the Duel-gamemode
 */
export enum Gamemode {
  QuestionQ = 0,
  Determination,
  Millionaire,
  Duel
}

/**
 * The PlayerState-enum contains every possible player state.
 * @value 0: Launch - the player will participate at the game
 * @value 1: Playing - the player is participating at the game
 * @value 2: Paused - the player is not disqualified but also not participating at the game
 * @value 3: Finished - the player has finished
 * @value 4: Disqualified - the player has been disqualified
 * @value 5: Spectating - the player is spectating
 */
export enum PlayerState {
  Launch = 0,
  Playing,
  Paused,
  Finished,
  Disqualified,
  Spectating
}

/**
 * The PlayerRole-enum contains every role a player can have.
 * @value 0: Host - the player is the host of the game
 * @value 1: Mod - the player is a moderator of the game
 * @value 2: Player - the player is a player of the game
 * @value 3: Spectator - the player is a spectator of the game
 */
export enum PlayerRole {
  Host = 0,
  Mod,
  Player,
  Spectator
}
//#endregion

//#region Millionaire
/**
 * The JokerType-enum contains every joker-type of the Millionaire-gamemode.
 * @value 0: Dummy - the dummy joker has been removed
 * @value 1: FiftyFifty - the fifty/fifty-joker
 * @value 2: Audience - the audience-joker
 * @value 3: Call - the call-joker
 */
export enum JokerType {
  Dummy = 0,
  FiftyFifty,
  Audience,
  Call
}
//#endregion

//#region Duel
//#endregion
//#endregion

//#region interfaces
//#region general
/**
 * The iGeneralQuestion-interface contains the same data as a question in the database.
 * @property questionId:    string    - the question's ID
 * @property question:      string    - the question string
 * @property pictureId?:    string    - (optional) the id of the question's picture
 * @property answer:        string    - the correct answer for the question
 * @property otherOptions:  string[]	- at least three incorrect answer-options
 * @property timeLimit:     number	  - the time limit for answering the question
 * @property difficulty:		number	  - the question's difficulty
 * @property explanation?:  string	  - (optional) an explanation for the question
 * @property categories?:		string[]	- (optional) the question's categories
 */
export interface iGeneralQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  answer: string;
  otherOptions: string[];
  timeLimit: number;
  difficulty: number;
  explanation?: string;
  categories?: string[];
}

/**
 * The iPlayerAction-interface contains the data of a basic player action.
 * @property username: string - the name of the user who sent the action-request
 * @property gameId: string - the ID of the game the action is to perform in
 * @property msgType: MessageType - the type of the sent data
 * @property data: any - the sent data
 */
export interface iPlayerAction {
  username: string;
  gameId: string;
  msgType: MessageType;
  data: any;
}

/**
 * The iChangePlayerRolesRequest-interface contains all essential data to change a player's roles.
 * Its message-type is 'ChangePlayerRolesRequest'.
 * @property username: string - the name of the user whose roles are to modify
 * @property toAdd?: PlayerRole[] - the roles that are to add
 * @property toRemove?: PlayerRole[] - the roles that are to remove
 */
export interface iChangePlayerRolesRequest {
  username: string;
  toAdd?: PlayerRole[];
  toRemove?: PlayerRole[];
}

/**
 * The iJoinGame-interface contains the data to join a game.
 * @property gameId: string - the ID of the game to join
 * @property username: string - the username that shall be used for the player
 * @property role: number - the role the player prefers
 */
export interface iJoinGame {
  gameId: string;
  username: string;
  role: number;
}

/**
 * The iJoinGame-interface contains the data to leave a game.
 * @property gameId: string - the ID og the game to leave
 * @property username: string - the name of the user to leave
 */
export interface iLeaveGame {
  gameId: string;
  username: string;
  //reason?
}

/**
 * The iStartGame-interface contains the data to start a game.
 * @property gameId: string - the ID of the game to start
 * @property username: string - the name of the user who requested the start
 */
export interface iStartGame {
  gameId: string;
  username: string;
}

/**
 * The iGeneralPlayerInputError-interface contains the data to notify a client that there was an input error.
 * @property message: string - the error message
 * @property data: any - additional error data
 */
export interface iGeneralPlayerInputError {
  message: string;
  data: any;
}

/**
 * The iGeneralHostArguments-interface contains the data that is essential to host a game of any gamemode.
 * @property gameId: string - the ID that the game shall have
 * @property gamemode: Gamemode - the gamemode of the game
 * @property owner: string - the username of the game's owner
 * @property ownerSocket: SocketIO.Socket - the socket of the game's owner
 * @property questionIds: string[] - the IDs of the questions for the game
 */
export interface iGeneralHostArguments {
  gameId: string;
  gamemode: Gamemode;
  owner: string;
  ownerSocket: SocketIO.Socket;
  questionIds: string[];
}

/**
 * The iSpectatingData-interface contains the data to notify a client that a message was sent to someone.
 * @property msgType: MessageType - the type of the message that has been sent to the target
 * @property data: any - the data that has been sent to the target
 * @property targetUsername: string - the name of the user the original message has been sent to
 */
export interface iSpectatingData {
  msgType: MessageType;
  data: any;
  targetUsername: string;
}
//#endregion

//#region QuestionQ
/**
 * The iQuestionQHostArguments-interface contains every modifier for a QuestionQ-game.
 * @property pointBase: number - when scoring the points are calculated by the formula: question's difficulty * (pointBase + question's time limit / (player's answering time + 1))
 * @property interQuestionGap number - minimum time span between questions (to receive feedback)
 */
export interface iQuestionQHostArguments {
  pointBase: number; // pointBase x difficulty = min points for the correctly answered question
  interQuestionGap: number; // minimum time in milliseconds between questions
}

/**
 * The iQuestionQStartGameData-interface contains the data a client needs to begin the game.
 * @property questionAmount: number - the amount of questions that will be asked before a player finishes
 * @property gameArguments: iQuestionQGameArguments - the game arguments the game has been hosted with
 */
export interface iQuestionQStartGameData {
  questionAmount: number;
  gameArguments: iQuestionQHostArguments;
}

/**
 * The iQuestionQSaveGameData contains the data to give priviledged spectators detailed information about the players performance.
 * This is also the data that will be saved into the database.
 * @property gameId: string - the game's ID
 * @property gamemode: Gamemode - the game's gamemode
 * @property gameArguments: iQuestionQHostArguments - the game arguments the game has been hosted with
 * @property players: iQuestionQPlayerData[] - detailed information about the palyers' performance
 * @property explanations: { questionId: string, explanation: string }[] - explanations for the questions
 */
export interface iQuestionQSaveGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iQuestionQHostArguments;
  players: iQuestionQPlayerData[];
  explanations: {
    questionId: string;
    explanation: string;
  }[];
}

/**
 * The iQuestionQGameData-interface contains the data to notify all players about the game's statistics
 * @property gameId: string - the game's ID
 * @property gamemode: Gamemode - the game's gamemode
 * @property gameArguments: iQuestionQHostArguments - the game arguments the game has been hosted with
 * @property playerStatistics: iQuestionQPlayerStatistic[] - the players' statistics
 */
export interface iQuestionQGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iQuestionQHostArguments;
  playerStatistics: iQuestionQPlayerStatistic[];
}

/**
 * The iQuestionQTip-interface contains the data to choose an answer-option.
 * @property questionId: string - the ID of the question that is to answer
 * @property answerId: string - the ID of the chosen answer
 */
export interface iQuestionQTip {
  questionId: string;
  answerId: string;
}

/**
 * The iQuestionQQuestion-interface contains the data to ask a client a question.
 * @property questionId: string - the question's ID
 * @property question: string - the question
 * @property pictureId?: string - (optional) the ID of the question's picture
 * @property options: [string, string][] - the four answer-options for the question containing the correct one
 * @property timeLimit: number - the question's time limit in milliseconds
 * @property difficulty: number - the question's difficulty
 * @property categories: string[] - the question's categories
 * @property questionTime: Date - the time the question has been sent to the client
 * @property timeCorrection: number - the current time correction for the client
 */
export interface iQuestionQQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  options: [string, string][];
  timeLimit: number;
  difficulty: number;
  categories?: string[];
  questionTime: Date;
  timeCorrection?: number;
}

/**
 * The iQuestionQTipFeedback-interface contains the data to notify a client about the result of their tip.
 * @property questionId: string - the ID of the question that has been answered
 * @property correct: boolean - the indicator for whether the given tip was correct
 * @property duration: number - the duration for answering the question
 * @property timeCorrection: number - the amount of time that has been subtracted from the time difference between the moment when the question was sent and the moment when the answer was received
 * @property points: number - the amount of points the player receives for their tip
 * @property score: number - the player's current score
 * @property message: string - a message telling the circumstances of the scoring
 * @property correctAnswer: string - the ID of the correct answer
 */
export interface iQuestionQTipFeedback {
  questionId: string;
  correct: boolean;
  duration: number;
  timeCorrection: number;
  points: number;
  score: number;
  message: string;
  correctAnswer: string; // answerId
}

/**
 * The iQuestionQPlayerDataAndExplanations-interface contains the data to enable a client to look into a player's performance.
 * @property player: iQuestionQPlayerData - all data the game collected for the player
 * @property explanations: { questionId: string, explanation: string }[] - explanations for the questions that have been asked
 */
export interface iQuestionQPlayerDataAndExplanations {
  player: iQuestionQPlayerData;
  explanations: {
    questionId: string;
    explanation: string;
  }[];
}

/**
 * The iQuestionQPlayerData-interface contains all data the game collects for a player.
 * @property username: string - the username of the player
 * @property roles: PlayerRole[] - the roles the player has
 * @property state: PlayerState - the current state of the player
 * @property score: number - the current score of the player
 * @property questions: [iQuestionQQuestion, string][] - an array of all questions that the player has been asked yet in combination with the id of the correct answer each
 * @property tips: iQuestionQTipData[] - a collection of every tip the player gave yet each in combination with the corresponding feedback
 */
export interface iQuestionQPlayerData {
  username: string;
  roles: PlayerRole[];
  state: PlayerState;
  score: number;
  questions: [iQuestionQQuestion, string][];
  tips: iQuestionQTipData[];
}

/**
 * The iQuestionQPlayerStatistic-interface contains the data to inform all clients about the new statistics of a player.
 * @property username: string - the player's username
 * @property score: number - the player's current score
 * @property state: PlayerState - the player's current score
 * @property roles: PlayerRole[] - the player's roles
 * @property questionIds: string[] - the IDs of the questions the player has answered yet
 * @property correctAnswers: number - the amount of questions the player has answered correctly yet
 * @property totalValuedTime: number - the total amount of time that has been valued as duration for questions of the player in milliseconds
 * @property totalTimeCorrection: number - the total amount of time that has been removed from the meassured time the player has taken to answer their questions
 */
export interface iQuestionQPlayerStatistic {
  username: string;
  score: number;
  state: PlayerState;
  roles: PlayerRole[];
  questionIds: string[];
  correctAnswers: number;
  totalValuedTime: number;
  totalTimeCorrection: number;
}

/**
 * The iQuestionQTipData-interface combines a tip a player has given with its corresponding feedback.
 * @property tip: iQuestionQTip - the tip the player has given
 * @property feedback: iQuestionQTipFeedback - the feedback for the tip
 */
export interface iQuestionQTipData {
  tip: iQuestionQTip;
  feedback: iQuestionQTipFeedback;
}
//#endregion

//#region Determination
/**
 * The iDeterminationHostArguments-interface contains every modifier for a Determination-game.
 * @property pointBase: number - when identifying a correct answer points are calculated by the formula: question's difficulty * (pointBase + question's time limit / (player's answering time + 1))
 * @property pointBaseWrongAnswerIdentified: number - when identifying a wrong answer points are calculated by the formula: question's difficulty * (pointBaseWrongAnswerIdentified + question's time limit / (player's answering time + 1))
 * @property interQuestionGap number - minimum time span between questions (to receive feedback)
 */
export interface iDeterminationHostArguments {
  pointBase: number; // pointBase x difficulty = min points for the correctly answered question
  pointBaseWrongAnswerIdentified: number; // pointBase x difficulty = min points for the correctly identified wrong answer
  interQuestionGap: number; // minimum time in milliseconds between questions
}

/**
 * The iQuestionQStartGameData-interface contains the data a client needs to begin the game.
 * @property questionAmount: number - the amount of questions that will be asked before a player finishes
 * @property gameArguments: iQuestionQGameArguments - the game arguments the game has been hosted with
 */
export interface iDeterminationStartGameData {
  questionAmount: number;
  gameArguments: iDeterminationHostArguments;
}

/**
 * The iDeterminationGameData-interface contains the data to give priviledged spectators detailed information about the players' performance.
 * This is also the data that will be saved into the database.
 * @property gameId: string - the game's ID
 * @property gamemode: Gamemode - the game's gamemode
 * @property gameArguments: iDeterminationHostArguments - the game arguments the game has been hosted with
 * @property players: iDeterminationPlayerData[] - detailed information about the palyers' performance
 */
export interface iDeterminationGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iDeterminationHostArguments;
  players: iDeterminationPlayerData[];
}

/**
 * The iDeterminationEndGameData-interface contains the data to notify all players about the player's statistics
 * @property playerStatistics: iDeterminationPlayerStatistic[] - the players' statistics
 */
export interface iDeterminationEndGameData {
  playerStatistics: iDeterminationPlayerStatistic[];
}

/**
 * The iDeterminationPlayerStatistic-interface contains the data to inform all clients about the current statistics of a player.
 * @property username: string - the player's username
 * @property score: number - the player's current score
 * @property state: PlayerState - the player's current score
 * @property roles: PlayerRole[] - the player's roles
 * @property tips: number - the amount of tips the player has given yet
 * @property correctTips: number - the amount of correct tips the player has given yet
 * @property totalValuedTime: number - the total amount of time that has been valued as duration for questions of the player in milliseconds
 * @property totalTimeCorrection: number - the total amount of time that has been removed from the meassured time the player has taken to answer their questions
 */
export interface iDeterminationPlayerStatistic {
  username: string;
  score: number;
  state: PlayerState;
  roles: PlayerRole[];
  tips: number;
  correctTips: number;
  totalValuedTime: number;
  totalTimeCorrection: number;
}

/**
 * The iDeterminationTip-interface contains the data to try to identify an answer-option.
 * @property questionId: string - the ID of the question the answer is for
 * @property answerId: string - the ID of the answer to identify
 * @property correct: boolean - the guess of the player whether the answer is correct
 */
export interface iDeterminationTip {
  questionId: string;
  answerId: string;
  correct: boolean;
}

/**
 * The iDeterminationQuestion-interface contains the data to ask a client a question.
 * @property questionId: string - the question's ID
 * @property question: string - the question
 * @property pictureId?: string - (optional) the ID of the question's picture
 * @property timeLimit: number - the question's time limit in milliseconds
 * @property difficulty: number - the question's difficulty
 * @property categories: string[] - the question's categories
 * @property questionTime: Date - the time the question has been sent to the client
 * @property timeCorrection: number - the current time correction for the client
 */
export interface iDeterminationQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  timeLimit: number;
  difficulty: number;
  categories?: string[];
  firstOption?: iDeterminationOption;
}

/**
 * The iDeterminationQuestionData-interface contains all data that is collected during questioning a single player a single question.
 * @property question: iDeterminationQuestion - the data that will be sent to the client when asking the question
 * @property options: iDeterminationOption[] - the four answer-options for the question containing three wrong answers and the correct one
 * @property correct: string - the answer-ID of the correct answer
 * @property questionTime?: Date - the time the question has been asked
 * @property explanation?: string - an explanation for the question
 * @property timeCorrection?: number - the current amount of time that will be subtracted from the meassured time difference between the moment the question is sent to the client and the moment the answer is received
 */
export interface iDeterminationQuestionData {
  question: iDeterminationQuestion;
  options: iDeterminationOption[];
  correct: string;
  questionTime?: Date;
  explanation?: string;
  timeCorrection?: number;
}

/**
 * The iDeterminationOption-interface combines an answer with its id.
 * @property answerId: string - the answer's ID
 * @property answer: string - the answer
 */
export interface iDeterminationOption {
  answerId: string;
  answer: string;
}

/**
 * The iDeterminationTipFeedback-interface contains the data to notify a client about the result of their tip.
 * @property questionId: string - the ID of the question the feedback relates to
 * @property tip: iDeterminationTip - the tip that resulted the feedback
 * @property correct: boolean - the indicator for whether the given tip was correct
 * @property duration: number - the duration for giving the tip
 * @property timeCorrection: number - the amount of time that has been subtracted from the time difference between the moment the question was sent and the moment the tip was received
 * @property points: number - the amount of points the player receives for their tip
 * @property score: number - the player's current score
 * @property message: string - a message telling the circumstances of the scoring
 * @property correctAnswer?: iDeterminationOption - (optional) the correct answer (if this property is not 'undefined' it means that the question is completed)
 * @property nextOption?: iDeterminationOption - (optional) the next answer-option that is to identify as either true or false
 */
export interface iDeterminationTipFeedback {
  questionId: string;
  tip: iDeterminationTip;
  correct: boolean;
  duration: number;
  timeCorrection: number;
  points: number;
  score: number;
  message: string;
  correctAnswer?: iDeterminationOption;
  nextOption?: iDeterminationOption;
}

/**
 * The iDeterminationPlayerData-interface contains all data the game collects for a player.
 * @property username: string - the username of the player
 * @property roles: PlayerRole[] - the roles the player has
 * @property state: PlayerState - the current state of the player
 * @property score: number - the current score of the player
 * @property questions: iDeterminationQuestionData[] - an array of the data of each question that the player has been asked yet
 * @property tipData: iDeterminationTipFeedback[] - a collection of every feedback the player got including its corresponding feedback
 */
export interface iDeterminationPlayerData {
  username: string;
  roles: PlayerRole[];
  state: PlayerState;
  score: number;
  questions: iDeterminationQuestionData[];
  tipData: iDeterminationTipFeedback[]; // filter qId length for next option
}
//#endregion

//#region Millionaire
/**
 * The iMillionaireHostArguments-interface contains every modifier for a Millionaire-game.
 * @property maxQuestions: number - the maximum amount of questions a millionaire may get
 * @property checkpoints: number - the score-values that indicate the checkpoints
 * @property jokers: JokerType[] - the list of jokers the millionaire has
 * @property scoreCalcA: number - the points for a correctly answered question are calculated by the formula: points = (current score + scoreCalcA) * scoreCalcB
 * @property scoreCalcB: number - the points for a correctly answered question are calculated by the formula: points = (current score + scoreCalcA) * scoreCalcB
 */
export interface iMillionaireHostArguments {
  maxQuestions: number; // maximum amount of questions per player
  // questionsPerDifficulty: number; // amount of questions per difficulty
  checkpoints: number[]; // score checkpoints
  jokers: JokerType[]; // jokers per player per millionaire
  scoreCalcA: number; // (current score + scoreCalcA) * scoreCalcB = points for a correctly answered question
  scoreCalcB: number;
}

/**
 * The iMillionaireGameData-interface contains the game's data that will be saved into the database.
 * @property gameId: string - the game's ID
 * @property gamemode: Gamemode - the game's gamemode
 * @property gameArguments: iMillionaireHostArguments - the game arguments the game has been hosted with
 * @property questions: iMillionaireQuestionData[] - detailed information about the questions of the game
 * @property players: iMillionairePlayerData[] - detailed information about the palyers' performance
 */
export interface iMillionaireGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iMillionaireHostArguments;
  questions: iMillionaireQuestionData[];
  players: iMillionairePlayerData[];
}

/**
 * The iMillionaireStartGameData-interface contains all data that a client needs to begin the game.
 * @property gameArguments: iMillionaireHostArguments - the game arguments the game has been hosted with
 * @property players: iMillionairePlayerData[] - the players of the game
 * @property millionaire?: iMillionairePlayerData - (optional) the current millionaire
 */
export interface iMillionaireStartGameData {
  gameArguments: iMillionaireHostArguments;
  players: iMillionairePlayerData[];
  millionaire?: iMillionairePlayerData;
}

/**
 * The iMillionaireAddQuestionsRequest-interface contains the data that is needed to add questions to the game.
 * @property questionIds: string[] - the IDs of the questions that are to add
 */
export interface iMillionaireAddQuestionsRequest {
  questionIds: string[];
}

/**
 * The iMillionaireAddQuestionsResponse-interface contains data to notify the user who orderd new questions of what questions have been added.
 * @property questionIds: string[] - the IDs of the questions that have been added
 */
export interface iMillionaireAddQuestionsResponse {
  questionIds: string[];
}

/**
 * The iMillionaireTip-interface contains all data the millionaire needs to give a tip for a question.
 * @property questionId: string - the question's ID
 * @property answerId: string - the ID of the chosen answer
 */
export interface iMillionaireTip {
  questionId: string;
  answerId: string;
}

/**
 * The iMillionairePlayerData-interface contains all data the game collects for a player.
 * @property username: string - the username of the player
 * @property roles: PlayerRole[] - the roles the player has
 * @property state: PlayerState - the current state of the player
 * @property score: number - the current score of the player
 * @property checkpoint: number - the player's current checkpoint
 * @property jokers: JokerType[] - a list of the player's jokers
 * @property currentQuestion?: iMillionairePlayerQuestionData - (optional) detailed data of the curent question of the player
 * @property questionData: iMillionairePlayerQuestionData[] - an array of the data of each question that the player has answered yet
 * @property karmaScore: number - the player's current karma-score
 * @property millionaireCounter: number - a counter that indicates how often the player has been millionaire yet
 * @property scoreArchieve: iMillioniareScoreEntry - an array of every score the player had when completing a millionaire-period and the corresponding date
 */
export interface iMillionairePlayerData {
  username: string;
  state: PlayerState;
  roles: PlayerRole[];
  score: number;
  checkpoint: number;
  jokers: JokerType[];
  currentQuestion?: iMillionairePlayerQuestionData;
  questionData: iMillionairePlayerQuestionData[];
  karmaScore: number;
  millionaireCounter: number;
  scoreArchive: iMillionaireScoreEntry[];
}

/**
 * The iMillionaireScoreEntry-interface combines a score a player had when completing a millionaire-period with the corresponding date.
 * @property score: number - the score the player ended their millionaire tenure with
 * @property date: Date - a timestamp marking the moment when the player's tenure as millionaire ended
 */
export interface iMillionaireScoreEntry {
  score: number;
  date: Date;
}

/**
 * The iMillionairePlayerQuestion-interface contains all data that is sent to the millionaire in order to ask them a question.
 * @property questionId: string - the question's ID
 * @property question: string - the question
 * @property pictureId?: string - (optional) the ID of the question's picture
 * @property options: iMillionaireAnswerOption[] - the four answer-options for the question containing the correct one
 * @property difficulty: number - the question's difficulty
 * @property categories?: string[] - (optional) the question's categories
 */
export interface iMillionairePlayerQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  options: iMillionaireAnswerOption[];
  difficulty: number;
  categories?: string[];
}

/**
 * The iMillionaireAnswerOption-interface combines an answer-option of a question with its ID.
 * @property answerId: string - the answer's ID
 * @property answer: string - the answer
 */
export interface iMillionaireAnswerOption {
  answerId: string;
  answer: string;
}

/**
 * The iMillionairePlayerQuestionData-interface contains all data that is corresponding to a question.
 * @property question: iMillionairePlayerQuestion - the data that is sent to the millionaire in order to ask them the question
 * @property correctAnswer: string - the correct answer's ID
 * @property questionTime: Date - a timestamp indicating when the question has been asked
 * @property tip?: iMillionaireTip - (optional) the tip that the millionaire has given for the question
 * @property audienceJokerData?: iMillionaireAudienceJokerData - (optional) all data that has been collected by the audience-joker, if activated
 * @property fiftyFiftyJokerData?: iMillionaireFiftyFiftyJokerData - (optional) all data that has been collected by the fifty/fifty-joker, if activated
 * @property callJokerData?: iMillionaireCallJokerData - (optional) all data that has been collected by the call-joker, if activated
 * @property feedback?: iMillionaireTipFeedback - (optional) the feedback for the tip the millionaire gave for the question
 * @property explanation?: string - (optional) an explanation for the question
 */
export interface iMillionairePlayerQuestionData {
  question: iMillionairePlayerQuestion;
  correctAnswer: string;
  questionTime: Date;
  tip?: iMillionaireTip;
  audienceJokerData?: iMillionaireAudienceJokerData;
  fiftyFiftyJokerData?: iMillionaireFiftyFiftyJokerData;
  callJokerData?: iMillionaireCallJokerData;
  feedback?: iMillionaireTipFeedback;
  explanation?: string;
}

/**
 * The iMillionaireQuestionData-interface contains all data that is needed to generate an iMillionairePlayerQuestion-interface-implementing JSON
 * @property questionId: string - the question's ID
 * @property question: string - the question
 * @property pictureId?: string - (optional) the ID of the question's picture
 * @property answer: string - the correct answer for the question
 * @property options: string[] - at least three wrong answer-options
 * @property difficulty: number - the question's difficulty
 * @property explanation?: string - (optional) an explanation for the question
 * @property categories?: string[] - (optional) the question's categories
 * @property questionCounter: number - a counter indicating how often this question has been asked yet
 */
export interface iMillionaireQuestionData {
  questionId: string;
  question: string;
  pictureId?: string;
  answer: string;
  otherOptions: string[];
  difficulty: number;
  explanation?: string;
  categories?: string[];
  questionCounter: number;
}

/**
 * The iMillionaireAudienceJokerRequest-interface contains all data that is needed to activate the audience-joker for a question.
 * @property questionId: string - the ID of the question for that the audience-joker shall be used (current question)
 */
export interface iMillionaireAudienceJokerRequest {
  questionId: string;
}

/**
 * The iMillionaireAudienceJokerResponse-interface contains data that is immediately sent to the millionaire after the audience-joker has been activated.
 * @property questionId: string - the ID of the question the audience-joker's response is ment for
 * @property possibleResponses: number - the amount of player's that can give a clue
 */
export interface iMillionaireAudienceJokerResponse {
<<<<<<< HEAD
  questionId: string;
=======
  questionId: string
>>>>>>> gs_commentary
  possibleResponses: number;
}

/**
 * The iMillionaireAudienceJokerData-interface contains all data that results out of the audience-joker.
 * @property playerClues: iMillionaireAudienceJokerPlayerClue[] - an array containing every player clue that has been given for the question
 * @property response: iMillionaireAudienceJokerResponse - the message the server sent the millionaire in response to their audience-joker request
 */
export interface iMillionaireAudienceJokerData {
  playerClues: iMillionaireAudienceJokerPlayerClueData[];
  response: iMillionaireAudienceJokerResponse;
}

/**
 * The iMillionaireAudienceJokerPlayerClueData-interface contains the data that is collected when a player gives a clue.
 * @property username: string - the name of the player who gave the clue
 * @property clue: iMillionaireAudienceJokerPlayerClue - the clue the player gave
 * @property karmaPoints?: number - (optional) the karma-points the player got for their clue
 */
export interface iMillionaireAudienceJokerPlayerClueData {
  username: string;
  clue: iMillionaireAudienceJokerPlayerClue;
  karmaPoints?: number;
}

/**
 * The iMillionaireAudienceJokerPlayerClue-interface contains the data of a player's audience-joker clue.
 * @property questionId: string - the ID of the question the clue is ment for
 * @property answerId: string - the answer-ID of the answer-option that is chosen in the clue
 */
export interface iMillionaireAudienceJokerPlayerClue {
  questionId: string;
  answerId: string;
}

/**
 * The iMillionaireFiftyFiftyJokerRequest-interface contains all data that results out of the fifty/fifty-joker.
 * @property questionId: string - the ID of the question for that the fifty/fifty-joker shall be used (current question)
 */
export interface iMillionaireFiftyFiftyJokerRequest {
  questionId: string;
}

/**
 * The iMillionaireFiftyFiftyJokerResponse-interface contains the data that is sent in response to the activation of the fifty/fifty-joker.
 * @property questionId: string - the ID of the question the fifty/fifty-joker response is ment for
 * @property remainingOptions: string[] - an array of the IDs of the remaning answer-options
 */
export interface iMillionaireFiftyFiftyJokerResponse {
  questionId: string;
  remainingOptions: string[]; // answerIds
}

/**
 * The iMillionaireAudienceJokerData-interface contains all data that results out of the fifty/fifty-joker.
 * @property response: iMillionaireFiftyFiftyJokerResponse - the message the server sent the millionaire in response to their fifty/fifty-joker request
 */
export interface iMillionaireFiftyFiftyJokerData {
  response: iMillionaireFiftyFiftyJokerResponse;
}

/**
 * The iMillionaireCallJokerRequest-interface contains all data that is needed to activate the call-joker for a question.
 * @property questionId: string - the ID of the question for that the call-joker shall be used (current question)
 */
export interface iMillionaireCallJokerRequest {
  questionId: string;
}

/**
 * The iMillionaireCallJokerResponse-interface contains the data that is sent in response to the activation of the call-joker.
 * @property questionId: string - the ID of the question the call-joker has been activated for
 * @property callOptions: iMillionairePlayerData[] - list of detailed data of the player's that can be called
 */
export interface iMillionaireCallJokerResponse {
  questionId: string;
  callOptions: iMillionairePlayerData[];
}

/**
 * The iMillionaireCallJokerCallRequest-interface contains the data that is used to call a player for help.
 * @property questionId: string - the ID of the question the joker is ment for
 * @property username: string - the name of the user that shall be called
 */
export interface iMillionaireCallJokerCallRequest {
  questionId: string;
  username: string;
}

/**
 * The iMillionaireCallJokerClue-interface contains the data of a player's clue-joker clue.
 * @property questionId: string - the ID of the question the clue is ment for
 * @property answerId: string - the answer-ID of the answer-option that is chosen in the clue
 */
export interface iMillionaireCallJokerClue {
  questionId: string;
  answerId: string;
}

/**
 * The iMillionaireCallJokerData-interface contains all data that results out of the call-joker.
 * @property callOptions: string[] - the names of the players the millionaire had to chose from
 * @property call?: string - (optional) the name of the called player
 * @property clue?: iMillionaireCallJokerClue - the clue the called player gave
 */
export interface iMillionaireCallJokerData {
  callOptions: string[]; // usernames
  call?: string; // username
  clue?: iMillionaireCallJokerClue;
}

/**
 * The iMillionaireTipFeedback-interface contains the data to notify a client about the result of their tip.
 * @property questionId: string - the ID of the question that has been answered
 * @property correct: boolean - the indicator for whether the given tip was correct
 * @property points: number - the amount of points the player receives for their tip
 * @property score: number - the player's current score
 * @property checkpoint: number - the player's current checkpoint
 * @property message: string - a message telling the circumstances of the scoring
 * @property correctAnswer: string - the ID of the correct answer
 * @property explanation?: string - (optional) an explanation for the question
 */
export interface iMillionaireTipFeedback {
  questionId: string;
  correct: boolean;
  points: number;
  score: number;
  checkpoint: number;
  message: string;
  correctAnswer: string;
  explanation?: string;
}

/**
 * The iMillionairePassRequest-interface contains the data that is needed to end the millionaire's tenure without their score falling back onto their last checkpoint.
 */
export interface iMillionairePassRequest {}

/**
 * The iMillionaireChooseMillionaireRequest contains the data that is sent to the owner and the moderators of a game in order to request them to chose the next millionaire.
 * @property players: iMillionairePlayerData[] - the players that are potential millionaires
 */
export interface iMillionaireChooseMillionaireRequest {
  players: iMillionairePlayerData[];
}

/**
 * The iMillionaireChooseMillionaireResponse-interface contians the data that is needed to choose the next millionaire.
 * @property username: string - the username of the next millionaire
 */
export interface iMillionaireChooseMillionaireResponse {
  username: string;
}

/**
 * The iMillionaireChooseQuestionRequest-interface contains the data that is sent to the owner and the moderators of a game in order to request them to chose the next question.
 * @property questions: iMillionaireQuestionData[] - a list of all questions that can be chosen
 */
export interface iMillionaireChooseQuestionRequest {
  questions: iMillionaireQuestionData[];
}

/**
 * The iMillionaireChooseQuestionResponse-interface contians the data that is needed to choose the next question.
 * @property questionId: string - the question-ID of the next questions
 */
export interface iMillionaireChooseQuestionResponse {
  questionId: string;
}

// unused
/**
 * The iMillionaireActionFeedback-interface contains all data that can be needed to give a user a feedback for the action they tried to perform.
 * @property requestType: MessageType - the type of the request the user sent
 * @property response: any - the response of the game
 */
export interface iMillionaireActionFeedback {
  requestType: MessageType;
  response: any;
}
//#endregion

//#region Duel
export interface iDuelStartGameData {
  gameId: string;
  gameArguments: iDuelHostArguments;
  players: string[]; // usernames
}
export interface iDuelEndGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iDuelHostArguments;
  playerData: iDuelPlayerData[];
  questionBases: iDuelQuestionBase[];
}
export interface iDuelHostArguments {
  scoreGoal: number; // needed points to win
  scoreMin: number; // losing score
  pointBase: number; // (pointBase + timeLimit / (duration + pointBase2)) x difficulty = points for the correctly answered question
  pointBase2: number;
  pointDeductionBase: number;
  pointDeductionBase2: number;
  pointDeductionWhenTooSlow: number;
  postfeedbackGap: number; // ms to next question
  choosingTime1: number;
  choosingTime2: number;
  maxCategoryChoiceRange: number;
  maxDifficultyChoiceRange: number;
}
export interface iDuelPlayerData {
  username: string;
  state: PlayerState;
  roles: PlayerRole[];
  score: number;
}
export interface iDuelSetReadyState {
  ready: boolean;
}
export interface iDuelQuestionBase extends iGeneralQuestion {
  questionCounter: number;
}
export interface iDuelPlayerQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  options: iDuelAnswerOption[];
  timeLimit: number;
  difficulty: number;
}
export interface iDuelPlayerQuestionData {
  question: iDuelPlayerQuestion;
  correctAnswer: string;
  questionTime: Date;
  timeCorrections: { [id: string]: number }; // username timeCorrection //[iDuelTimeCorrection, iDuelTimeCorrection];
  // outOfTime: string[]; // usernames
  explanation?: string;
  tip?: iDuelTipData;
  feedback?: iDuelTipFeedback;
}
export interface iDuelAnswerOption {
  answerId: string;
  answer: string;
}
export interface iDuelTimeCorrection {
  username: string;
  timeCorrection: number;
}
export interface iDuelTip {
  questionId: string;
  answerId: string;
}
export interface iDuelTipData {
  username: string;
  answerId: string;
  duration: number;
  timeCorrection: number;
  correct?: boolean;
  message?: string;
}
export interface iDuelTipFeedback {
  questionId: string;
  tip: iDuelTipData;
  scoring: { [id: string]: iDuelScoringData }; // username scoring data
  correctAnswer: string;
  explanation?: string;
}
export interface iDuelScoringData {
  points: number;
  score: number;
  state: PlayerState;
}

export enum DuelChoice {
  Difficulty = 0,
  Category
}
export interface iDuelChooseChoiceRequest {}
export interface iDuelChooseChoiceReply {
  choiceChoice: DuelChoice;
}

export interface iDuelChooseDifficultyRequest {
  difficulties: number[];
}
export interface iDuelChooseDifficultyReply {
  difficulty: number;
}

export interface iDuelChooseCategoryRequest {
  categories: string[];
}
export interface iDuelChooseCategoryReply {
  category: string;
}
//#endregion
<<<<<<< HEAD
//#endregion
=======
//#endregion
>>>>>>> gs_commentary
