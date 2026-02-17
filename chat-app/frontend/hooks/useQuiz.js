const { createContext, useState } = require("react");

const quizContext  = createContext();

export const QuizProvider = (userId) => {
    const [quizData, setQuizData] = useState(null);
    
}