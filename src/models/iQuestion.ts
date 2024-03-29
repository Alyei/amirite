/**
 * Interface for a question.
 * @interface
 * @author Andrej Resanovic
 */
export interface Question {
  id: string;
  difficulty: number;
  timeLimit: number;
  question: string;
  answer: string;
  otherOptions: string[];
  explanation: string;
  image?: Buffer;
}
