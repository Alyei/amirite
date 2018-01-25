//#region OverAll
export interface iGeneralQuestion {
    questionId:     string;
    question:       string;
    pictureId?:     string;
    answer:         string;
    otherOptions:   string[];
    timeLimit:      number;
    difficulty:     number;
}

export interface iGeneralPlayerInputError {
    message:    string;
    data:       any;
}

export interface iGeneralHostArguments {
    gameId:         string;
    gamemode:       Gamemode;
    usernames:      string[];
    questionIds:    string[];
}

export enum Gamemode {
    QuestionQ = 0,
    Determination,
}

export enum PlayerState {
    Launch = 0,
    Playing,
    Paused,
    Finished,
    Disqualified,
}

// every possible message has its own entry here
export enum MessageType {
    PlayerInputError = 0,
    QuestionQQuestion,
    QuestionQTipFeedback,
    QuestionQPlayerData,
    QuestionQTip,
    QuestionQGameData,
    QuestionQHostArguments,
    DeterminationPlayerData,
    DeterminationQuestion,
    DeterminationTip,
    DeterminationOption,
    DeterminationTipFeedback, //...
}
export enum GameAction {
    Start = 0,
    Stop,
    Pause,
    Save,
    Load,
}
//#endregion

//#region QuestionQ
export interface iQuestionQHostArguments {
    
}
export interface iQuestionQGameData {
    gameId:     string;
    players:    iQuestionQPlayerData[];
}
export interface iQuestionQTip {
    questionId: string;
    answerId:   string;
}
export interface iQuestionQQuestion {
    questionId:     string;
    question:       string;
    pictureId?:     string;
    options:        [string, string][];
    timeLimit:      number;
    difficulty:     number;
    questionTime:   Date;
}
export interface iQuestionQTipFeedback {
    questionId: string;
    correct:    boolean;
    duration:   number;
    // time correction
    points:     number;
    score:      number;
    message:    string;
}
export interface iQuestionQPlayerData {
    username:   string;
    state:      number;
    score:      number;
    questions:  [iQuestionQQuestion, string][];
    tips:       iQuestionQTipData[];
    // time correction
}
export interface iQuestionQTipData {
    tip:        iQuestionQTip;
    feedback:   iQuestionQTipFeedback;
}
//#endregion

//#region Determination
export interface iDeterminationHostArguments {
    
}
export interface iDeterminationGameData {
    gameId:     string;
    players:    iDeterminationPlayerData[];
}
export interface iDeterminationTip {
    questionId: string;
    answerId:   string;
    correct:    boolean;
}
export interface iDeterminationQuestion {
    questionId:     string;
    question:       string;
    pictureId?:     string;
    timeLimit:      number;
    difficulty:     number;
    questionTime:   Date;
}
export interface iDeterminationQuestionData {
    question:   iDeterminationQuestion;
    options:    { [id: string]: string };
    correct:    string;
}
export interface iDeterminationOption {
    questionId: string;
    option:     [string, string];
}
export interface iDeterminationTipFeedback {
    tip:        iDeterminationTip;
    correct:    boolean;
    duration:   number;
    // time correction
    points:     number;
    score:      number;
    message:    string;
}
export interface iDeterminationTipData {
    tip:        iDeterminationTip;
    feedback:   iDeterminationTipFeedback;
}
export interface iDeterminationPlayerData {
    username:   string;
    state:      number;
    score:      number;
    // current question
    questions:  iDeterminationQuestionData[];
    tips:       iDeterminationTipData[];
}
//#endregion

//#region Others
export interface iMillionaire {
}
export interface iMillionaireTip {
    questionId: string;
    answerId:   string;
}
export interface iMillionaireJokerRequest {
    jokerId:    string;
    arguments:  string[];
}
export interface iMillionairePlayerClue {
    questionId: string;
    answerId:   string;
}
export interface iMillionaireQuestion {
    questionId: string;
    question:   string;
    options:    [string, string][];
    difficulty: number;
}
export interface iMillionaireTipFeedback {
    questionId: string;
    correct:    boolean;
    score:      number;
    message:    string;
}

export interface iDuel {
}
export interface iDuelTip {
    questionId: string;
    answerId:   string;
}
export interface iDuelCategoryChoice {
    category:   string;
}
export interface iDuelDifficultyChoice {
    difficulty: number;
}
export interface iDuelCategoryOptions {
    categories: [string, string][];
}
export interface iDuelDifficultyOptions {
    difficulties:   number[];
}
export interface iDuelQuestion {
    questionId: string;
    question:   string;
    options:    [string, string][];
    timeLimit:  number;
    difficulty: number;
}
export interface iDuelTipFeedback {
    questionId: string;
    correct:    boolean;
    score:      number;
    message:    string;
}

export interface iTrivialPursuit {
}
export interface iTrivialPursuitTip {
    questionId: string;
    answerId:   string;
}
export interface iTrivialPursuitCategoryChoice {
    category:   string;
}
export interface iTrivialPursuitCategoryOptions {
    categories: [string, string][];
    difficulty: number;
}
export interface iTrivialPursuitQuestion {
    questionId: string;
    question:   string;
    options:    [string, string][];
    difficulty: number;
}
export interface iTrivialPursuitTipFeedback {
    questionId: string;
    correct:    boolean;
    score:      string[];
    message:    string;
}
export interface iTrivialPursuitSpectateInfo {
    type:       string;
    data:       iTrivialPursuitCategoryOptions | iTrivialPursuitCategoryChoice | iTrivialPursuitQuestion | iTrivialPursuitTipFeedback;
}
//#endregion