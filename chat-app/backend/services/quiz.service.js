import prisma from "../lib/prisma";
import { llmService } from "./llm.service";
import { textExtractor } from "./text.extractor";

export const quizService = {

    async generateQuiz({cv, offre}){
        const cvText = await textExtractor.extractFromPdf(cv);
        const promt = await prisma.prompt.findUnique({
            where: {name: "cv-offre-generate-quiz"}
        });

        if(!promt){
            throw new Error("cette fonctionnaliter n'est pas operationnele");
        }

        const data = await llmService.generateQuiz({systemPrompt: promt.content, cvText, offre});

        return data;
    },

    async getQuizByOffre({offreId}){
        const quiz = prisma.quiz.findUnique({
            where: { offreId}
        });

        if(quiz){
            return {
                quiz
            }
        }
        else{
            throw new Error("not found");
            
        }
    },

    async getQuizsByRecruteurId({recruteurId}){
        const quizs = prisma.offres.findMay({
            where: {recruteurId}
        });

        if(quiz){
            return {
                quizs
            }
        }
        else{
            throw new Error("not found");
            
        }
    }

};
