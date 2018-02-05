import { Question } from "../models/iQuestion";
import * as mongo from "mongoose";
import { QuestionModel } from "../models/Schemas";
import { logger } from "./logging";
import { generateId } from "./helper";

export class Editor {
  public SaveQuestion(questiondata: Question): void {
    const newQuestion: any = new QuestionModel({
      id: generateId(),
      difficulty: questiondata.difficulty,
      timeLimit: questiondata.timeLimit,
      question: questiondata.question,
      answer: questiondata.answer,
      otherOptions: questiondata.otherOptions,
      explanation: questiondata.explanation
    });

    newQuestion.save((err: any, q: any) => {
      if (err) {
        logger.log("error", require("util").inspect(err));
        return err;
      }
    });
  }
}

//Server is dying at assigning question from questiondata.question, saying
//it is undefined. Check on google why it hands up on third property
