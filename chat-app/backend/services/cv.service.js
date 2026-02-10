import prisma from "../lib/prisma";
import { llmServicer } from "./llm.service";

export const cvService = {
    convertCustomSections(cvJson) {
        return cvJson.custom_sections?.map(section => ({
            title: section.title,
            items: section.items.map(item => ({
            name: item.label,
            highlights: item.details
            }))
        })) || [];
    },

     convertToJsonResume(cvJson) {
    return {
        basics: {
        name: cvJson.personal_info.full_name,
        email: cvJson.personal_info.email,
        phone: cvJson.personal_info.phone,
        location: {
            address: cvJson.personal_info.location
        },
        url: cvJson.personal_info.website || "",
        summary: cvJson.summary || ""
        },

        skills: [
        {
            name: "Hard Skills",
            keywords: cvJson.skills.hard_skills
        },
        {
            name: "Soft Skills",
            keywords: cvJson.skills.soft_skills
        }
        ],

        work: cvJson.experience.map(exp => ({
        name: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: exp.start_date,
        endDate: exp.end_date,
        summary: "",
        highlights: exp.tasks
        })),

        education: cvJson.education.map(ed => ({
        institution: ed.school,
        studyType: ed.degree,
        area: ed.details.join(", "),
        startDate: ed.start_date,
        endDate: ed.end_date
        })),

        projects: cvJson.projects.map(p => ({
        name: p.title,
        description: p.description,
        keywords: p.technologies
        })),

        certificates: cvJson.certifications.map(c => ({
        name: c,
        date: ""
        })),

        interests: cvJson.interests.map(i => ({
        name: i
        })),

        meta: {
        match_score: cvJson.matching_index.score,
        match_details: cvJson.matching_index.justification
        }
    };
    },

    async generateCv({offre, existing, poste = 'unknow tu devras deduire de toi meme'}){
        const prompt = await prisma.Prompt.findUnique({
            where: {name: "cv_normalizer_prompt"}
        });
        if(!prompt){
            throw new Error("cette fonctionnaliter n'est pas operationnele");
        }
        const data = await llmServicer.generateCv({offre, poste, instructions: prompt.content, existing});

        return {cv: this.convertToJsonResume(data.cv), letter: data.letter};
    }
}