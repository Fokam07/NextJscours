import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }
      

    // 1. Sauvegarde message utilisateur
    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content: message.trim(),
      },
    });

    console.log("User message créé :", userMessage);

    // 2. Récupère l'historique récent (contexte pour l'IA)
    const history = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 20, // limite pour éviter token overflow
    });

    // Format OpenAI-compatible
    const messagesForGroq = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Ajoute le message actuel (déjà sauvegardé, mais on le met pour cohérence)
    messagesForGroq.push({ role: "user", content: message.trim() });

    // 3. Appel Groq
    const completion = await groq.chat.completions.create({
      messages: messagesForGroq,
      model: "llama-3.3-70b-versatile",          // ← Change ici pour tester (fiable en 2026)
      // Alternative rapide : "llama-3.1-8b-instant"
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiReply = completion.choices?.[0]?.message?.content?.trim() || "Désolé, je n'ai pas pu répondre.";

    console.log("Réponse Groq :", aiReply.substring(0, 150) + "...");

    // 4. Sauvegarde réponse IA
    const aiMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiReply,
      },
    });

    console.log("AI message créé :", aiMessage);

    // 5. Renvoie les deux pour que le frontend puisse les afficher correctement
    return NextResponse.json({ userMessage, aiMessage });

  } catch (error) {
    console.error("Erreur POST /api/chat :", error.message || error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}

// GET : historique (renvoie directement le tableau, pas { messages })
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages); // ← tableau direct, pas { messages }
  } catch (error) {
    console.error("Erreur GET /api/chat :", error);
    return NextResponse.json({ error: "Erreur récupération messages" }, { status: 500 });
  }
}