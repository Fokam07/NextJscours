import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic"; // ✅ évite certaines optimisations build

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GROQ_API_KEY manquante (variable d'environnement).");
  }
  return new Groq({ apiKey });
}

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // ✅ instanciation lazy (runtime seulement)
    const groq = getGroqClient();

    // 1) Sauvegarde message utilisateur
    const userMessage = await prisma.message.create({
      data: { role: "user", content: message.trim() },
    });

    // 2) Historique récent
    const history = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messagesForGroq = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // (Optionnel) évite doublon si le message est déjà dans history
    const last = messagesForGroq[messagesForGroq.length - 1];
    if (!last || last.content !== message.trim() || last.role !== "user") {
      messagesForGroq.push({ role: "user", content: message.trim() });
    }

    // 3) Appel Groq
    const completion = await groq.chat.completions.create({
      messages: messagesForGroq,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiReply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu répondre.";

    // 4) Sauvegarde réponse IA
    const aiMessage = await prisma.message.create({
      data: { role: "assistant", content: aiReply },
    });

    return NextResponse.json({ userMessage, aiMessage });
  } catch (error) {
    console.error("Erreur POST /api/chat :", error?.message || error);

    // ✅ si la clé manque, renvoie 500 mais avec message utile
    const msg = String(error?.message || "");
    if (msg.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        { error: "Configuration serveur: GROQ_API_KEY manquante." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur GET /api/chat :", error);
    return NextResponse.json(
      { error: "Erreur récupération messages" },
      { status: 500 },
    );
  }
}
