import { quizService } from "@/backend/services/quiz.service";
import { NextResponse } from "next/server";

export async function POST(request) {
    try{
        const userId = request.headers.get('x-user-id');
        
        if(!userId){
            console.log('unAuthorized');
            return NextResponse.json(
                {error: 'unroconized'},
                {status: 403}
            );
        }

        const contentType = request.headers.get('content-type') || '';
        if(contentType.includes('multipart/form-data')){
            const formData = await request.formData();
            const cv = formData.get('cv');
            const offre = formData.get('offre');
            if(cv && offre){
                const data = await quizService.generateQuiz({cv, offre});
                return NextResponse.json(data);
            }
            else
                throw new Error("erreur de recuperation des donnes");
                
        }

    }catch (error) {
        console.log('erreur Post /api/quiz:', error);
        return NextResponse.json(
            {error: error.message},
            {status: 500}
        );
    } 
}