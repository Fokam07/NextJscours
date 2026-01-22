import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import Groq from "groq-sdk";

const groq = Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 

export async function Post(request) {
    try {
        const { message } = await request.json(); // Corrected method to lowercase 'json'

        if (!message?.trim()) {
            return NextResponse.json({ error: "Message requis" }, { status: 400 });
        }  // Moved the return statement above

        const userMessage = await prisma.message.create({
            data: {
                role: 'user',
                content: message.trim(), // Use 'content' (fix case sensitivity)
            }
        });

        const history = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' }, // Fixed typo 'oderBy'
            take: 20,
        }); 

        const messagesForGroq = history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        messagesForGroq.push({
            role: 'user',
            content: message.trim(),
        });

        const completion = await groq.chat.completions.create({
            messages: messagesForGroq,
            models: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
            stream: true, // Fixed case sensitivity for 'stream'
        }); 

        const aiReply = completion.choices[0]?.message?.content || "Désolé, je n'ai pas de réponse à cela."; // Fixed 'choises' typo

        const aiMessage = await prisma.message.create({
            data: {
                role: 'assistant',
                content: aiReply,
            }
        });

        return NextResponse.json({
            userMessage, 
            aiMessage,
        }); 
        
    } catch (error) {
        console.error("Erreur lors du traitement du message:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}