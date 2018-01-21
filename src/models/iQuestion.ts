export interface Question {
  quetionid: string;
  difficulty: number;
  timeLimit: number;
  question: string;
  answer: string;
  otherOptions: string[];
}
