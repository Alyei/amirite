import { Question } from "../models/iQuestion";
import * as mongo from "mongoose";
import { QuestionModel } from "../models/Schemas";
import { logger } from "./logging";
import { generateId } from "./helper";

/**
 * Contains the function that saves new questions to the database.
 * @class
 * @author Andrej Resanovic
 */
export class Editor {
  /**
   * Saves the question to the database.
   * @param questiondata - The JSON containing the question data.
   */
  public SaveQuestion(questiondata: Question): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      const newQuestion: any = new QuestionModel({
        id: generateId(),
        difficulty: questiondata.difficulty,
        timeLimit: questiondata.timeLimit,
        question: questiondata.question,
        answer: questiondata.answer,
        otherOptions: questiondata.otherOptions,
        explanation: questiondata.explanation,
        image: questiondata.image
      });

      newQuestion.save((err: any, q: any) => {
        if (err) {
          logger.log("error", require("util").inspect(err));
          return reject(err);
        }
        logger.log(
          "info",
          "New question (%s) has been added to the database.",
          newQuestion.id
        );

        return resolve();
      });
    });
  }
}

//Server is dying at assigning question from questiondata.question, saying
//it is undefined. Check on google why it hands up on third property
