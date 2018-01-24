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
    send:           (gameId: string, username: string, msgType: MessageType, data: {}) => void;
    usernames:      string[];
    questions:      string[];
}

export enum Gamemode {
    QuestionQ = 0,
}
// every interface except the HostArguments has its own entry here (similar inter.. from different gamemodes use the same entry)
export enum MessageType {
    Error = 0,
    Question,
    TipFeedback,
    PlayerData,
    GameData,
}
//#endregion

//#region QuestionQ
export interface iQuestionQHostArguments {
    //#region overwritten by iGeneralHostArguments
    send?:          (username: string, msgType: MessageType, data: {}) => void;
    gameEnded?:     () => void;
    usernames?:     string[];
    questions?:     string[];
    logInfo?:       (toLog: string) => void;
    logSilly?:      (toLog: string) => void;
    //#endregion
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
}
export interface iQuestionQTipData {
    tip:        iQuestionQTip;
    feedback:   iQuestionQTipFeedback;
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

export interface iDetermination {
}
export interface iDeterminationTip {
    questionId: string;
    answerId:   string;
    correct:    boolean;
}
export interface iDeterminationQuestion {
    questionId:     string;
    question:       string;
    firstOption:    [string, string];
    timeLimit:      number;
    difficulty:     number;
}
export interface iDeterminationNextOption {
    questionId: string;
    nextOption: [string, string];
}
export interface iDeterminationTipFeedback {
    questionId: string;
    answerId:   string;
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