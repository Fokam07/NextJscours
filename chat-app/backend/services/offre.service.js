import prisma from "../lib/prisma"

export const offresService = {
    async createOffre({content, recruteurId}){
        return await prisma.offres.create({
            data:{
                content
            }
        })
    }
}