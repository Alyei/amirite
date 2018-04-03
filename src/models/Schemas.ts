import * as mongoose from "mongoose";
import { generateId } from "../server/helper";
import { Schema } from "inspector";
import { Gamemode } from "./GameModels";
//import { Gamemode, iQuestionQHostArguments } from "./GameModels";

/**
 * The mongoose schema of the userobject.
 * @author Andrej Resanovic
 */
let userSchema: mongoose.Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z0-9]{0,16}/i
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i
  },
  emailConfirmed: Date,
  created: {
    type: Date,
    required: false,
    default: Date.now()
  },
  rooms: [{}],
  firstName: String,
  lastName: String,
  notifications: {
    type: [
      {
        type: String,
        message: String,
        tags: [String]
      }
    ]
  }
});

/**
 * Mongoose schema of a question object.
 * @author Andrej Resanovic
 */
let Question: mongoose.Schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9a-z]{10}$/i
  },
  difficulty: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  otherOptions: [
    {
      type: [String],
      required: true
    }
  ],
  explanation: {
    type: String,
    required: true
  },
  genre: {
    type: [String],
    required: false
  },
  image: {
    type: Buffer,
    required: false
  }
});

/**
 * Mongoose schema of gamedata for QuestionQ.
 * @author Georg Schubbauer
 */
let QuestionQGameData = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  gamemode: {
    type: Gamemode, //!!!
    required: true
  },
  gameArguments: {
    type: {},
    required: true
  },
  players: {
    type: [],
    required: true
  },
  explanations: {
    type: [
      {
        questionId: String,
        explanation: String
      }
    ],
    required: true
  }
});

/**
 * Mongoose schema of gamedata for Determination.
 * @author Georg Schubbauer
 */
let DeterminationGameData = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  gamemode: {
    type: Gamemode,
    required: true
  },
  gameArguments: {
    type: {},
    required: true
  },
  players: {
    type: [],
    required: true
  }
});

/**
 * Mongoose schema of gamedata for Duel.
 * @author Georg Schubbauer
 */
let DuelGameData = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  gamemode: {
    type: Gamemode,
    required: true
  },
  gameArguments: {
    type: {},
    required: true
  },
  players: {
    type: [],
    required: true
  },
  questionBases: {
    type: {},
    required: true
  }
});

/**
 * Mongoose schema of gamedata for Millionaire.
 * @author Georg Schubbauer
 */
let MillionaireGameData = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  gamemode: {
    type: Gamemode,
    required: true
  },
  gameArguments: {
    type: {},
    required: true
  },
  players: {
    type: [],
    required: true
  },
  questions: {
    type: [],
    required: true
  }
});

/**
 * Model of the question schema.
 */
const QuestionModel: any = mongoose.model("question", Question);

/**
 * Model of the usermodel schema.
 */
const UserModel: any = mongoose.model("user", userSchema);

/**
 * Model of QuestionQ gamedata schema.
 */
const QuestionQGameDataModel: any = mongoose.model(
  "questionQGameData",
  QuestionQGameData
);

/**
 * Model of Determination gamedata schema.
 */
const DeterminationGameDataModel: any = mongoose.model(
  "determinationGameData",
  DeterminationGameData
);

/**
 * Model of Millionaire gamedate schema.
 */
const MillionaireGameDataModel: any = mongoose.model(
  "millionaireGameData",
  MillionaireGameData
);
const DuelGameDataModel: any = mongoose.model("duelGameData", DuelGameData);

export {
  UserModel,
  QuestionModel,
  QuestionQGameDataModel,
  DeterminationGameDataModel,
  MillionaireGameDataModel,
  DuelGameDataModel
};
