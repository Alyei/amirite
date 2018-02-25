import { exec } from "child_process";

//#region OverAll
export interface iGeneralQuestion {
  questionId: string;
  question: string;
  pictureId?: string;
  answer: string;
  otherOptions: string[];
  timeLimit: number;
  difficulty: number;
  explanation?: string;
}

export interface iPlayerAction {
  username: string;
  gameId: string;
  msgType: MessageType;
  data: any;
}

export interface iJoinGame {
  gameId: string;
  username: string;
}

export interface iLeaveGame {
  gameId: string;
  username: string;
  //reason?
}

export interface iStartGame {
  gameId: string;
  username: string;
}

export interface iGeneralPlayerInputError {
  message: string;
  data: any;
}

export interface iGeneralHostArguments {
  gameId: string;
  gamemode: Gamemode;
  owner: string;
  ownerSocket: SocketIO.Socket;
  questionIds: string[];
}

export interface iSpectatingData {
  msgType: MessageType;
  data: any;
  targetUsername: string;
}

export enum Gamemode {
  QuestionQ = 0,
  Determination,
  Millionaire
}

export enum PlayerState {
  Launch = 0,
  Playing,
  Paused,
  Finished,
  Disqualified,
  Spectating
}

export enum PlayerRole {
  Host = 0,
  Mod,
  Player,
  Spectator
}

export enum JokerType {
  Dummy = 0,
  FiftyFifty,
  Audience,
  Call
}

// every possible message has its own entry here
export enum MessageType {
  // general
  PlayerInputError = 100,
  SpectatingData,

  // QuestionQ
  QuestionQQuestion = 1,
  QuestionQTipFeedback,
  QuestionQPlayerDataAndExplanations,
  QuestionQTip,
  QuestionQGameData,
  QuestionQHostArguments,
  QuestionQStartGameData,

  // Determination
  DeterminationQuestion = 10,
  DeterminationTipFeedback,
  DeterminationPlayerData,
  DeterminationTip,
  DeterminationGameData,
  DeterminationHostArguments,

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
}
export enum GameAction {
  Start = 0,
  Stop,
  Pause,
  Save,
  Load
}
//#endregion

//#region QuestionQ
export interface iQuestionQHostArguments {
  pointBase: number; // pointBase x difficulty = min points for the correctly answered question
  interQuestionGap: number; // minimum time in milliseconds between questions
}
export interface iQuestionQStartGameData {
  questionAmount: number;
  gameArguments: iQuestionQHostArguments;
}
export interface iQuestionQSaveGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iQuestionQHostArguments;
  players: iQuestionQPlayerData[];
  explanations: {
    questionId: string,
    explanation: string
  }[];
}
export interface iQuestionQGameData {
  gameId: string;
  gamemode: Gamemode;
  gameArguments: iQuestionQHostArguments;
  playerStatistics: iQuestionQPlayerStatistic[];
}
export interface iQuestionQPlayerStatistic {
  username: string;
  score: number;
  correctAnswers: number;
  totalTime: number;
  totalTimeCorrection: number;
}
export interface iQuestionQTip {
  questionId: string;
  answerId: string;
}
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
    questionId: string,
    explanation: string
  }[];
}
export interface iQuestionQPlayerData {
  username: string;
  role: PlayerRole;
  state: PlayerState;
  score: number;
  questions: [iQuestionQQuestion, string][];
  tips: iQuestionQTipData[];
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
  role: PlayerRole;
  state: number;
  score: number;
  questions: iDeterminationQuestionData[];
  tips: iDeterminationTipData[]; // filter qId length for next option
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
  possibleCheckpoints: number[];
  gameArguments: iMillionaireHostArguments;
  players: iMillionairePlayerData;
}
export interface iMillionaireTip {
  questionId: string;
  answerId: string;
}
export interface iMillionairePlayerData {
  username: string;
  state: PlayerState;
  role: PlayerRole;
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
export interface iMillionairePassRequest { }
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

//#region Others
export interface iDuel {}
export interface iDuelTip {
  questionId: string;
  answerId: string;
}
export interface iDuelCategoryChoice {
  category: string;
}
export interface iDuelDifficultyChoice {
  difficulty: number;
}
export interface iDuelCategoryOptions {
  categories: [string, string][];
}
export interface iDuelDifficultyOptions {
  difficulties: number[];
}
export interface iDuelQuestion {
  questionId: string;
  question: string;
  options: [string, string][];
  timeLimit: number;
  difficulty: number;
}
export interface iDuelTipFeedback {
  questionId: string;
  correct: boolean;
  score: number;
  message: string;
}

export interface iTrivialPursuit {}
export interface iTrivialPursuitTip {
  questionId: string;
  answerId: string;
}
export interface iTrivialPursuitCategoryChoice {
  category: string;
}
export interface iTrivialPursuitCategoryOptions {
  categories: [string, string][];
  difficulty: number;
}
export interface iTrivialPursuitQuestion {
  questionId: string;
  question: string;
  options: [string, string][];
  difficulty: number;
}
export interface iTrivialPursuitTipFeedback {
  questionId: string;
  correct: boolean;
  score: string[];
  message: string;
}
export interface iTrivialPursuitSpectateInfo {
  type: string;
  data:
    | iTrivialPursuitCategoryOptions
    | iTrivialPursuitCategoryChoice
    | iTrivialPursuitQuestion
    | iTrivialPursuitTipFeedback;
}
//#endregion
