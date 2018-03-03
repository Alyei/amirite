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
  categories?: string[];
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
  Millionaire,
  Duel,
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

//#region duel
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
  poindDetuctionWhenTooSlow: number;
  postfeedbackGap: number; // ms
}
export interface iDuelPlayerData {
  username: string;
  state: PlayerState;
  role: PlayerRole;
  score: number;
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
  scoring: { [id: string]: iDuelScoringData}; // username scoring data
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
  Category,
}
export interface iDuelChooseChoiceRequest { }
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
