import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    // Sauvegarde du message utilisateur
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
      },
    });

    // Appel à l'API Groq (notez le "model" au singulier)
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "groq/compound-mini",
    });

    // Sauvegarde de la réponse de l'IA
    const aiMessage = await prisma.message.create({
      data: {
        content: completion.choices[0]?.message?.content || "",
        role: 'assistant',
      },
    });

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}

// Route GET pour récupérer l'historique
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}