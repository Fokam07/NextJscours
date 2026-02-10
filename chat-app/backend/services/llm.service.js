/**
 * Service pour interagir avec un LLM (Groq ou Gemini)
 * IMPORTANT: ne jamais faire planter le module au moment de l'import
 */

import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";

/* ------------------------- Helpers ------------------------- */

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `${name} manquante. Ajoute-la dans ton environnement (Docker/Render/Vercel/.env)`,
    );
  }
  return value;
}

/* ------------------------- GROQ SERVICE ------------------------- */

export const llmService = {
  /**
   * Générer une réponse via Groq
   * @param {Array} messages - [{role, content}]
   * @param {Array} attachments - optionnel
   */
  async generateResponse(messages, attachments = []) {
    try {
      // ✅ Ne valide la clé QUE quand on appelle la fonction
      const apiKey = requireEnv("GROQ_API_KEY");

      let enrichedMessages = [...messages];

      if (attachments.length > 0) {
        const fileList = attachments
          .map((att) => `- ${att.name} (${att.type})`)
          .join("\n");
        const lastUserMessage = enrichedMessages[enrichedMessages.length - 1];

        if (lastUserMessage && lastUserMessage.role === "user") {
          lastUserMessage.content = `${lastUserMessage.content}\n\n[Fichiers joints:\n${fileList}]`;
        }
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: enrichedMessages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API Error: ${error?.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        content: data.choices?.[0]?.message?.content ?? "",
        model: data.model,
        tokens: data.usage?.total_tokens ?? 0,
      };
    } catch (error) {
      console.error("Erreur Groq LLM:", error);
      // ✅ Message clair côté API route
      throw new Error(error.message || "Erreur lors de la génération (Groq)");
    }
  },

  async generateConversationTitle(firstMessage) {
    try {
      const apiKey = requireEnv("GROQ_API_KEY");
      const cleanMessage = firstMessage.trim().substring(0, 300);

      const messages = [
        {
          role: "system",
          content: `Tu es un expert en création de titres concis et descriptifs.
Règles strictes:
- 3 à 6 mots maximum
- Descriptif, en français
- Pas de guillemets, pas de ponctuation finale
- Commence directement par le titre

Exemples:
Message: "Comment faire un gâteau au chocolat?"
Titre: Recette gâteau au chocolat`,
        },
        {
          role: "user",
          content: `Génère un titre court (3-6 mots) pour:\n\n"${cleanMessage}"`,
        },
      ];

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.5,
            max_tokens: 50,
          }),
        },
      );

      if (!response.ok) throw new Error("Erreur API Groq (title)");

      const data = await response.json();
      let title = (data.choices?.[0]?.message?.content ?? "").trim();

      title = title.replace(/^["']|["']$/g, "").replace(/\.$/, "").substring(0, 50);

      return title || this.generateSimpleTitle(firstMessage);
    } catch (error) {
      console.error("Erreur génération titre:", error);
      return this.generateSimpleTitle(firstMessage);
    }
  },

  generateSimpleTitle(message) {
    const cleaned = (message ?? "").trim();
    const words = cleaned.split(/\s+/).slice(0, 5);
    let title = words.join(" ");

    if (title.length > 50) title = title.substring(0, 47) + "...";
    return title || "Nouvelle conversation";
  },

  getAvailableModels() {
    return [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Le plus puissant, excellent pour les tâches complexes",
        tokensPerMinute: 30000,
        maxTokens: 8192,
        bestFor: ["Raisonnement", "Analyse", "Code complexe"],
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B",
        description: "Très rapide, bon pour les réponses simples",
        tokensPerMinute: 20000,
        maxTokens: 8192,
        bestFor: ["Réponses rapides", "Questions simples", "Chat"],
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        description: "Bon équilibre vitesse/qualité",
        tokensPerMinute: 15000,
        maxTokens: 32768,
        bestFor: ["Contexte long", "Analyse de documents"],
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        description: "Modèle de Google, polyvalent",
        tokensPerMinute: 15000,
        maxTokens: 8192,
        bestFor: ["Usage général", "Instructions"],
      },
    ];
  },

  estimateTokens(text) {
    return Math.ceil((text ?? "").length / 4);
  },

  canHandleContext(modelId, messages) {
    const model = this.getAvailableModels().find((m) => m.id === modelId);
    if (!model) return false;

    const totalText = (messages ?? []).map((m) => m.content).join(" ");
    const estimatedTokens = this.estimateTokens(totalText);
    return estimatedTokens < model.maxTokens * 0.8;
  },
};

/* ------------------------- GEMINI SERVICE ------------------------- */

/**
 * ✅ Instanciation LAZY pour éviter tout crash au build/import
 */
let _ai = null;
function getGeminiClient() {
  if (_ai) return _ai;

  const apiKey =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    "";

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY (ou GEMINI_API_KEY) manquante pour Gemini.");
  }

  _ai = new GoogleGenAI({ apiKey });
  return _ai;
}

const chats = new Map();

/** ✅ Supabase admin (server only) */
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import os from "os";

/** Télécharge un fichier depuis Supabase Storage et renvoie un Buffer */
async function downloadFromStorage(bucket, path) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
  if (error) throw error;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Sauvegarde un fichier temporaire sur le disque (temp Windows/Linux) */
async function saveTempFile(buffer, filename) {
  const dir = join(os.tmpdir(), "chat-app-uploads");
  await mkdir(dir, { recursive: true });

  const safeName = String(filename || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const tempPath = join(dir, `${Date.now()}_${crypto.randomUUID()}_${safeName}`);

  await writeFile(tempPath, buffer);
  return tempPath;
}

export const llmServicer = {
  async generateResponse(message, messages, attachments = [], conversationId) {
    try {
      const ai = getGeminiClient();

      let chat = chats.get(conversationId);
      if (!chat) {
        const history = [...(messages ?? [])].map((m) => ({
          role: m.role === "assistant" ? "model" : m.role,
          parts: [{ text: m.content }],
        }));

        chat = ai.chats.create({
          model: "gemini-2.5-flash",
          history,
        });

        chats.set(conversationId, chat);
      }

      const attachmentParts = [];

      for (const at of attachments) {
        // ✅ Nouveau format recommandé: { bucket, path, fileName, mimeType, size }
        // On ne tente Gemini upload que si bucket+path existent
        if (!at?.bucket || !at?.path) continue;

        // 1) Download depuis Supabase Storage
        const buffer = await downloadFromStorage(at.bucket, at.path);

        // 2) Sauvegarder en fichier temporaire
        const tempPath = await saveTempFile(buffer, at.fileName);

        // 3) Upload à Gemini depuis un vrai chemin local temporaire
        const file = await ai.files.upload({ file: tempPath });

        if (file?.mimeType && file?.uri) {
          attachmentParts.push(createPartFromUri(file.uri, file.mimeType));
        }
      }

      const response = await chat.sendMessage({
        message: createUserContent([message, ...attachmentParts]),
        config: { temperature: 0.7 },
      });

      return {
        content: response.text ?? "",
        model: response.modelVersion,
        tokens: response.usageMetadata?.totalTokenCount ?? 0,
      };
    } catch (error) {
      console.error("Erreur Gemini LLM:", error);
      throw new Error(error.message || "Erreur lors de la génération (Gemini)");
    }
  },
};


