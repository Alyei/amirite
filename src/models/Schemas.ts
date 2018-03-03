import * as mongoose from "mongoose";
import { generateId } from "../server/helper";
import { Schema } from "inspector";
import { Gamemode } from "./GameModels";
//import { Gamemode, iQuestionQHostArguments } from "./GameModels";

/**
 * The mongoose-schema of the userobject for the database.
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
})

let Room: mongoose.Schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9a-z]{10}$/i
  },
  owner: {
    required: true,
    type: String,
    unique: false
  },
  members: {
    type: [{ username: String, role: Number }],
    required: true
  },
  name: {
    type: String,
    required: true,
    match: /^[0-9a-z]{0,32}$/i
  }
});

const QuestionModel: any = mongoose.model("question", Question);

const UserModel: any = mongoose.model("user", userSchema);

const QuestionQGameDataModel: any = mongoose.model(
  "questionQGameData",
  QuestionQGameData
);
const DeterminationGameDataModel: any = mongoose.model(
  "determinationGameData",
  DeterminationGameData
);
const MillionaireGameDataModel: any = mongoose.model(
  "millionaireGameData",
  MillionaireGameData
);
const DuelGameDataModel: any = mongoose.model(
  "duelGameData",
  DuelGameData
);

const RoomModel: any = mongoose.model("room", Room);

/**
 * @returns The usermodel.
 */
export { UserModel, QuestionModel, RoomModel, QuestionQGameDataModel, DeterminationGameDataModel, MillionaireGameDataModel, DuelGameDataModel };
