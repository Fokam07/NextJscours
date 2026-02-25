// app/api/chat/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import Groq from "groq-sdk";
import { roleService } from "@/backend/services/role.service";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      message,
      roleId = null,           // ← nouveau : ID du rôle choisi (optionnel)
      conversationId = null,   // optionnel – si tu veux plusieurs conversations plus tard
    } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // ───────────────────────────────────────────────
    // 1. Récupérer le system prompt du rôle (si choisi)
    // ───────────────────────────────────────────────
    let systemPrompt = null;
    let roleUsed = null;

    if (roleId) {
      const selectedRole = await roleService.getRoleById(roleId, /* userId */ request.headers.get("x-user-id"));

      if (selectedRole) {
        systemPrompt = selectedRole.system_prompt;
        roleUsed = {
          id: selectedRole.id,
          name: selectedRole.name,
          icon: selectedRole.icon || "🤖",
        };

        // Optionnel : incrémenter le compteur d'utilisation
        roleService.incrementUsageCount(roleId).catch((err) =>
          console.warn("Échec incrément usage", err)
        );
      } else {
        console.warn(`Rôle ${roleId} non trouvé ou non autorisé`);
      }
    }

    // ───────────────────────────────────────────────
    // 2. Sauvegarde message utilisateur
    // ───────────────────────────────────────────────
    const userMessage = await prisma.message.create({
      data: {
        role: "user",
        content: message.trim(),
        // Si tu veux stocker le rôle utilisé :
        // roleId: roleId || null,
        // conversationId: conversationId || null,
      },
    });

    // ───────────────────────────────────────────────
    // 3. Récupère l'historique récent
    // ───────────────────────────────────────────────
    // Pour l'instant on garde simple (tous les messages)
    // → plus tard tu pourras filtrer par conversationId
    const history = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 20,
      take: 20,
    });

    const messagesForGroq = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Ajout du message actuel
    messagesForGroq.push({ role: "user", content: message.trim() });

    // ───────────────────────────────────────────────
    // 4. Préparation des messages avec system prompt
    // ───────────────────────────────────────────────
    let finalMessages = messagesForGroq;

    if (systemPrompt) {
      finalMessages = [
        { role: "system", content: systemPrompt },
        ...messagesForGroq,
      ];
    }

    // ───────────────────────────────────────────────
    // 5. Appel Groq
    // ───────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      messages: finalMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiReply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu répondre.";
    const aiReply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Désolé, je n'ai pas pu répondre.";

    // ───────────────────────────────────────────────
    // 6. Sauvegarde réponse IA
    // ───────────────────────────────────────────────
    const aiMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiReply,
        // roleId: roleId || null,     // si tu veux tracer
      },
    });

    // ───────────────────────────────────────────────
    // 7. Réponse au frontend
    // ───────────────────────────────────────────────
    return NextResponse.json({
      userMessage,
      aiMessage,
      roleUsed,           // ← permet d'afficher "Réponse de : [Nom du rôle]"
    });

  } catch (error) {
    console.error("Erreur POST /api/chat :", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 },
    );
  }
}

// GET : historique (inchangé)
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur GET /api/chat :", error);
    return NextResponse.json(
      { error: "Erreur récupération messages" },
      { status: 500 }
    );
  }
}
