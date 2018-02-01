import { Question } from "../models/iQuestion";
import * as mongo from "mongoose";
import { QuestionModel } from "../models/Schemas";
import { logger } from "./logging";

export class Editor {
  public SaveQuestion(questiondata: Question): void {
    console.log("This is the JSON: \r\n");
    console.log(questiondata);
    const newQuestion: any = new QuestionModel({
      difficulty: questiondata.difficulty,
      timeLimit: questiondata.timeLimit,
      question: questiondata.question,
      answer: questiondata.answer,
      otherOptions: questiondata.otherOptions
    });
    newQuestion.save((err: any, q: any) => {
      if (err) {
        logger.log("info", "Question could not be saved: %s", q.question);
        return err;
      }
    });
  }
}

//Server is dying at assigning question from questiondata.question, saying
//it is undefined. Check on google why it hands up on third property
