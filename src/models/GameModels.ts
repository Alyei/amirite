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
  DuelPlayerData,
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
 * The iChangePlayerRolesRequest-interface is sent to change a player's roles.
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
 * The iJoinGame-interface is sent to join a game.
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
 * The iJoinGame-interface is sent to leave a game.
 * @property gameId: string - the ID og the game to leave
 * @property username: string - the name of the user to leave
 */
export interface iLeaveGame {
  gameId: string;
  username: string;
  //reason?
}

/**
 * The iStartGame-interface is sent to start a game.
 * @property gameId: string - the ID of the game to start
 * @property username: string - the name of the user who requested the start
 */
export interface iStartGame {
  gameId: string;
  username: string;
}

/**
 * The iGeneralPlayerInputError-interface is sent to the client to notify them that there was an input error.
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
 * The iSpectatingData-interface is sent to the client to notify them that a message was sent to someone.
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
 * The iQuestionQStartGameData-interface is sent to the client in order to enable them to begin the game.
 * @property questionAmount: number - the amount of questions that will be asked before a player finishes
 * @property gameArguments: iQuestionQGameArguments - the game arguments the game has been hosted with
 */
export interface iQuestionQStartGameData {
  questionAmount: number;
  gameArguments: iQuestionQHostArguments;
}

/**
 * The iQuestionQSaveGameData is sent to give priviledged spectators detailed information about the players performance.
 * This is also the data that will be saved into the database.
 * @property gameId: string - the game's ID
 * @property gamemode: Gamemode - the game's gamemode
 * @property gameArguments: iQuestionQHostArguments - the game arguments the game has been hosted with
 * @property players: iQuestionQPlayerData - detailed information about the palyers' performance
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
 * The iQuestionQGameData-interface is sent to notify all players about the game's statistics
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
 * The iQuestionQTip-interface is sent from a client to the server to choose an answer option.
 * @property questionId: string - the ID of the question that is to answer
 * @property answerId: string - the ID of the chosen answer
 */
export interface iQuestionQTip {
  questionId: string;
  answerId: string;
}

/**
 * !!!
 */
export interface iQuestionQQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  options: [string, string][];
  timeLimit: number;
  difficulty: number;
  questionTime: Date;
  timeCorrection?: number;
}
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
export interface iQuestionQPlayerDataAndExplanations {
  player: iQuestionQPlayerData;
  explanations: {
    questionId: string;
    explanation: string;
  }[];
}
export interface iQuestionQPlayerData {
  username: string;
  roles: PlayerRole[];
  state: PlayerState;
  score: number;
  questions: [iQuestionQQuestion, string][];
  tips: iQuestionQTipData[];
}
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
export interface iQuestionQTipData {
  tip: iQuestionQTip;
  feedback: iQuestionQTipFeedback;
}
//#endregion

//#region Determination
export interface iDeterminationHostArguments {
  pointBase: number; // pointBase x difficulty = min points for the correctly answered question
  pointBaseWrongAnswerIdentified: number; // pointBase x difficulty = min points for the correctly identified wrong answer
  interQuestionGap: number; // minimum time in milliseconds between questions
}
export interface iDeterminationGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iDeterminationHostArguments;
  players: iDeterminationPlayerData[];
}
export interface iDeterminationTip {
  questionId: string;
  answerId: string;
  correct: boolean;
}
export interface iDeterminationQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  timeLimit: number;
  difficulty: number;
  firstOption?: iDeterminationOption;
}
export interface iDeterminationQuestionData {
  question: iDeterminationQuestion;
  options: iDeterminationOption[];
  correct: string;
  questionTime?: Date;
  explanation?: string;
  timeCorrection?: number;
}
export interface iDeterminationOption {
  answerId: string;
  answer: string;
}
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
export interface iDeterminationTipData {
  tip: iDeterminationTip;
  feedback?: iDeterminationTipFeedback;
}
export interface iDeterminationPlayerData {
  username: string;
  roles: PlayerRole[];
  state: PlayerState;
  score: number;
  questions: iDeterminationQuestionData[];
  tips: iDeterminationTipData[]; // filter qId length for next option
}
export interface iDeterminationPlayerStatistic {
  username: string;
  score: number;
  state: PlayerState;
  roles: PlayerRole[];
  questionIds: string[];
  correctAnswers: number;
  totalValuedTime: number;
  totalTimeCorrection: number;
}
export interface iDeterminationEndGameData {
  playerStatistics: iDeterminationPlayerStatistic[];
}
//#endregion

//#region Millionaire
export interface iMillionaireHostArguments {
  maxQuestions: number; // maximum amount of questions per player
  // questionsPerDifficulty: number; // amount of questions per difficulty
  checkpoints: number[]; // score checkpoints
  jokers: JokerType[]; // jokers per player ??per millionaire??
  scoreCalcA: number; // (current score + scoreCalcA) * scoreCalcB = points for a correctly answered question
  scoreCalcB: number;
}
export interface iMillionaireGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iMillionaireHostArguments;
  questions: iMillionaireQuestionData[];
  players: iMillionairePlayerData[];
}
export interface iMillionaireStartGameData {
  gameArguments: iMillionaireHostArguments;
  players: iMillionairePlayerData[];
  millionaire?: iMillionairePlayerData;
}
export interface iMillionaireTip {
  questionId: string;
  answerId: string;
}
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
export interface iMillionaireScoreEntry {
  score: number;
  date: Date;
}
export interface iMillionairePlayerQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  options: iMillionaireAnswerOption[];
  difficulty: number;
}
export interface iMillionaireAnswerOption {
  answerId: string;
  answer: string;
}
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
export interface iMillionaireQuestionData {
  questionId: string;
  question: string;
  pictureId?: string;
  answer: string;
  otherOptions: string[];
  difficulty: number;
  explanation?: string;
  questionCounter: number;
}

// sent to inform about AudienceJoker
export interface iMillionaireAudienceJokerRequest {
  questionId: string;
}
export interface iMillionaireAudienceJokerResponse {
  possibleResponses: number;
}
export interface iMillionaireAudienceJokerData {
  playerClues: iMillionaireAudienceJokerPlayerClueData[];
  response: iMillionaireAudienceJokerResponse;
}
export interface iMillionaireAudienceJokerPlayerClueData {
  username: string;
  clue: iMillionaireAudienceJokerPlayerClue;
  karmaPoints?: number;
}
// sent from audience and to the player
export interface iMillionaireAudienceJokerPlayerClue {
  questionId: string;
  answerId: string;
}
export interface iMillionaireFiftyFiftyJokerRequest {
  questionId: string;
}
export interface iMillionaireFiftyFiftyJokerResponse {
  remainingOptions: string[]; // answerIds
}
export interface iMillionaireFiftyFiftyJokerData {
  response: iMillionaireFiftyFiftyJokerResponse;
}

export interface iMillionaireCallJokerRequest {
  questionId: string;
}
export interface iMillionaireCallJokerResponse {
  questionId: string;
  callOptions: iMillionairePlayerData[];
}
export interface iMillionaireCallJokerCallRequest {
  questionId: string;
  username: string;
}
export interface iMillionaireCallJokerClue {
  questionId: string;
  answerId: string;
}
export interface iMillionaireCallJokerData {
  callOptions: string[]; // usernames
  call?: string; // username
  clue?: iMillionaireCallJokerClue;
}

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
// --> Server
export interface iMillionairePassRequest {}
export interface iMillionaireChooseMillionaireRequest {
  players: iMillionairePlayerData[];
}
export interface iMillionaireChooseMillionaireResponse {
  username: string;
}
export interface iMillionaireChooseQuestionRequest {
  questions: iMillionaireQuestionData[];
}
export interface iMillionaireChooseQuestionResponse {
  questionId: string;
}
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
//#endregion