import { ArrayManager } from "./ArrayManager";
import {
  iQuestionQQuestion,
  PlayerRole,
  PlayerState,
  iQuestionQTip,
  iQuestionQTipFeedback,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  MessageType,
  iQuestionQHostArguments,
  iQuestionQPlayerData,
  Gamemode
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { QuestionQPlayer } from "./QuestionQPlayer";

export enum QuestionQGamePhase {
  Setup = 0,
  Running,
  Ended
}

export class QuestionQCore {
  readonly Gamemode: Gamemode = Gamemode.QuestionQ;
  private _players: QuestionQPlayer[];
  private _questions: iGeneralQuestion[];
  private _gamePhase: QuestionQGamePhase;
  private _logSilly?: (toLog: string) => void;
  private _logInfo?: (toLog: string) => void;

  get Players(): QuestionQPlayer[] {
    return this._players;
  }

  //constructor of QuestionQCore
  //_send function to send JSONs to a specific player
  //_gameEnded function to be executed, when the game ended
  //users list of usernames UNIQUE
  //questions list of questions UNIQUE
  public constructor(
    logInfo: (toLog: string) => void,
    logSilly: (toLog: string) => void,
    private _gameEnded: () => void,
    questions: iGeneralQuestion[],
    players?: PlayerBase[],
    gameArguments?: iQuestionQHostArguments
  ) {
    this._gamePhase = QuestionQGamePhase.Setup;

    this._logInfo = logInfo;
    this._logSilly = logSilly;

    this._questions = [];
    if (questions) {
      let am: ArrayManager = new ArrayManager(questions);
      this._questions = am.ShuffleArray();
    }

    this._players = [];
    if (players) {
      for (let player of players) {
        this._players.push(new QuestionQPlayer(player.GetArguments()));
      }
    }
  }

  public GetPlayerData(): iQuestionQPlayerData[] {
    return this._players;
  }

  //returns the json that is sent to a player + the key for the correct answer
  public GetQuestionQQuestion(
    question: iGeneralQuestion
  ): [iQuestionQQuestion, string] {
    let am: ArrayManager = new ArrayManager("A B C D".split(" "));
    const letters: string[] = am.ShuffleArray();
    let answers: [string, string][] = [];
    answers.push([letters[0], question.answer]);
    for (let i: number = 1; i < letters.length; i++) {
      answers.push([letters[i], question.otherOptions[i - 1]]);
    }
    answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

    am.collection = answers;
    return [
      {
        questionId: question.questionId,
        difficulty: question.difficulty,
        timeLimit: question.timeLimit,
        pictureId: question.pictureId,
        question: question.question,
        options: answers,
        questionTime: new Date()
      },
      letters[0]
    ];
  }

  // returns whether there was an error or not
  public DisqualifyUser(username: string): boolean {
    let player: iQuestionQPlayerData | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      if (this._logInfo)
        this._logInfo("could not find player '" + username + "'");
      return false;
    }

    player.state = PlayerState.Disqualified;
    this.CheckForEnd();
    return true;
  }

  // returns wether it was successful
  // - only before the game has ended
  // - only new users
  public AddUser(player: PlayerBase): boolean {
    if (this._gamePhase == QuestionQGamePhase.Setup) {
      this._players.push(new QuestionQPlayer(player.GetArguments()));
      return true;
    }
    if (this._gamePhase == QuestionQGamePhase.Running) {
      let newPlayer: QuestionQPlayer = new QuestionQPlayer(player.GetArguments());
      this._players.push(newPlayer);
      if (newPlayer.state == PlayerState.Launch)
        this.QuestionPlayer(newPlayer);
      return true;
    }
    return false;
  }

  /*
  // returns wether it was successful
  // - if no player finished yet
  // - only new questions
  public AddQuestion(question: iGeneralQuestion): boolean {
    let finished: boolean = false;
    for (let p of this._players) {
      if (p.state != PlayerTag.Finished) finished = true;
    }
    if (!finished) {
      this._questions.push(question);
      return true;
    }
    return false;
  }*/

  // starts the game
  // if _send, _endGame, _players & _questions are set
  // returns whether it was successful
  public Start(): boolean {
    if (this._players && this._questions) {
      this._gamePhase = QuestionQGamePhase.Running;
      for (let player of this._players) {
        if (player.state == PlayerState.Launch) {
          player.state = PlayerState.Playing;
          this.QuestionPlayer(player);
        }
      }
      return true;
    } else return false;
  }

  // forces the game's end
  public Stop(): void {
    this._gamePhase = QuestionQGamePhase.Ended;

    this._gameEnded();
  }

  // ends the game when specific conditions are current
  // - only while running
  // to check whenever player leaves, is disqualified and whenever a tip is given
  public CheckForEnd(): void {
    if (this._gamePhase == QuestionQGamePhase.Running) {
      // check for whether everyone finished
      let allFinished: boolean = true;
      for (let player of this._players) {
        if (
          player.state != PlayerState.Finished &&
          player.state != PlayerState.Disqualified
        )
          allFinished = false;
      }

      if (allFinished) this.Stop();
    }
  }

  // questions the player
  // only while running
  private QuestionPlayer(player: QuestionQPlayer): void {
    if (this._gamePhase == QuestionQGamePhase.Running) {
      // if there are questions left
      if (player.questions.length < this._questions.length) {
        // generate nextQuestion
        const nextQuestionBase:
          | iGeneralQuestion
          | undefined = this._questions.find(
          x =>
            player.questions.find(y => y[0].questionId == x.questionId) ==
            undefined
        );
        // L-> find a question you cannot find in player.questions
        if (!nextQuestionBase) {
          if (this._logInfo)
            this._logInfo(
              "could not find next question in '" +
                this._questions.toString() +
                "''" +
                player.questions.toString() +
                "'"
            );
          return;
        }
        const nextQuestion: [
          iQuestionQQuestion,
          string
        ] = this.GetQuestionQQuestion(nextQuestionBase);

        // send nextQuestion to Username
        player.Inform(
          MessageType.QuestionQQuestion,
          nextQuestion[0]
        );
        // add question to the player's questions
        player.questions.push(nextQuestion);
      } else {
        // finished
        player.state = PlayerState.Finished;
        player.Inform(MessageType.QuestionQPlayerData, player);

        this.CheckForEnd();
      }
    }
  }

  // to be called whenever a player gives a tip
  public PlayerGivesTip(username: string, tip: iQuestionQTip): void {
    let player: QuestionQPlayer | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      if (this._logInfo)
        this._logInfo("could not find player '" + username + "'");
      return;
    }
    // only while running and if the player is ingame
    if (
      this._gamePhase == QuestionQGamePhase.Running &&
      player.state == PlayerState.Playing
    ) {
      // only the player did not give a tip for this question before
      if (!player.tips.find(x => x.tip.questionId == tip.questionId)) {
        const PlayerQuestionTuple:
          | [iQuestionQQuestion, string]
          | undefined = player.questions.find(
          x => x[0].questionId == tip.questionId
        );
        // if the player has not been asked this question
        if (!PlayerQuestionTuple) {
          player.Inform(
            MessageType.PlayerInputError,
            "You were not asked this question >:c"
          );
          return;
        }

        const duration: number =
          new Date().getTime() - PlayerQuestionTuple[0].questionTime.getTime();
        let points: number = 0;
        let feedback: iQuestionQTipFeedback = {
          questionId: tip.questionId,
          correct: false,
          duration: 0,
          points: 0,
          score: 0,
          message: "unset"
        };
        // if the in time
        if (duration < PlayerQuestionTuple[0].timeLimit) {
          // if correct
          if (tip.answerId == PlayerQuestionTuple[1]) {
            points = Math.floor(
              PlayerQuestionTuple[0].difficulty *
                PlayerQuestionTuple[0].timeLimit /
                (1 + duration)
            );
            player.score += points;

            feedback.correct = true;
            feedback.duration = duration;
            feedback.points = points;
            feedback.score = player.score;
            feedback.message = "correct answer";
          } else {
            feedback.duration = duration;
            feedback.points = points;
            feedback.score = player.score;
            feedback.message = "wrong answer";
          }
        } else {
          feedback.duration = duration;
          feedback.points = points;
          feedback.score = player.score;
          feedback.message = "too slow";
        }
        player.Inform(MessageType.QuestionQTipFeedback, feedback);

        //add to playertipdata
        this.QuestionPlayer(player);
      } else {
        const message: iGeneralPlayerInputError = {
          message: "You already gave a tip for this question",
          data: { QuestionId: tip.questionId }
        };
        player.Inform(MessageType.PlayerInputError, message);
      }
    } else {
      const message: iGeneralPlayerInputError = {
        message: "You are not allowed to give a tip",
        data: { GamePhase: this._gamePhase, PlayerState: player.state }
      };
      player.Inform(MessageType.PlayerInputError, message);
    }
  }
}
