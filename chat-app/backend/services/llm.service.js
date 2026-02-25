/**
 * Service pour interagir avec le LLM le model IA
 * Avec support de génération de titres intelligents et system prompts personnalisés
 */

import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import {z} from 'zod'
import zodToJsonSchema from "zod-to-json-schema";

export const llmService = {
  /**
   * Générer une réponse du LLM (Groq/Llama)
   * @param {Array} messages - Historique des messages [{role, content}]
   * @param {Array} attachments - Fichiers joints (optionnel)
   * @param {string} systemPrompt - Prompt système personnalisé (optionnel)
   * @returns {Object} - {content, model, tokens}
   */
  async generateResponse(messages, attachments = [], systemPrompt = null) {
    try {
      // ✅ Ne valide la clé QUE quand on appelle la fonction
      const apiKey = requireEnv("GROQ_API_KEY");

      let enrichedMessages = [...messages];

      // Injecter le system prompt si fourni
      if (systemPrompt) {
        enrichedMessages = [
          { role: "system", content: systemPrompt },
          ...enrichedMessages
        ];
      }

      // Si des images sont attachées, ajouter une note dans le contexte
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
  
  async generateQuiz({systemPrompt, cvText, offre}) {
    try {
      // Construire le contexte avec les pièces jointes si présentes
      let enrichedMessages = [];

      // Injecter le system prompt si fourni
      if (systemPrompt) {
        enrichedMessages = [
          { role: "system", content: systemPrompt },
          ...enrichedMessages
        ];
      }

      if(cvText && offre){
        enrichedMessages.push({
          role: "user",
          content:`
            ok peut tu donc me generer ce ce quiz
            voici le cv dont j'ai extrait le text er l'offre

            ### Offre d’emploi :
            ${offre}

            ### CV du candidat :
            ${cvText}
            
          `
        })
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
        const error = await response.json();
        throw new Error(
          `Groq API Error: ${error.error?.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      const raw = data.choices[0].message.content;
      const json = raw.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(json);

      return {
        content: data.choices[0].message.content,
        model: data.model,
        tokens: data.usage.total_tokens,
      };
    } catch (error) {
      console.error("Erreur Groq LLM:", error);
      throw new Error("Erreur lors de la génération de la réponse");
    }
  },
  
  async generateQuiz({systemPrompt, cvText, offre}) {
    try {
      // Construire le contexte avec les pièces jointes si présentes
      let enrichedMessages = [];

      // Injecter le system prompt si fourni
      if (systemPrompt) {
        enrichedMessages = [
          { role: "system", content: systemPrompt },
          ...enrichedMessages
        ];
      }

      if(cvText && offre){
        enrichedMessages.push({
          role: "user",
          content:`
            ok peut tu donc me generer ce ce quiz
            voici le cv dont j'ai extrait le text er l'offre

            ### Offre d’emploi :
            ${offre}

            ### CV du candidat :
            ${cvText}
            
          `
        })
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
        const error = await response.json();
        throw new Error(
          `Groq API Error: ${error.error?.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      const raw = data.choices[0].message.content;
      const json = raw.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(json);

      return {
        data: parsed
      };
    } catch (error) {
      console.error("Erreur Groq LLM:", error);
      throw new Error("Erreur lors de la génération du quiz");
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
            - Le titre DOIT faire entre 3 et 6 mots maximum
            - Le titre DOIT être descriptif et capturer l'essence du sujet
            - Le titre DOIT être en français
            - PAS de guillemets, PAS de ponctuation finale
            - Commence directement par le titre sans préambule
            - Sois créatif mais précis

            Exemples:
            Message: "Comment faire un gâteau au chocolat?"
            Titre: Recette gâteau au chocolat

            Message: "J'ai besoin d'aide pour mon code Python qui ne fonctionne pas"
            Titre: Débogage code Python

            Message: "Quels sont les meilleurs endroits à visiter à Paris?"
            Titre: Guide touristique Paris`,
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
            messages: messages,
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
    const cleaned = message.trim();
    const words = cleaned.split(/\s+/).slice(0, 5);
    let title = words.join(" ");

    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title || "Nouvelle conversation";
  },

  /**
   * Liste des modèles Groq disponibles
   */
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

// ==================== GEMINI SERVICE ====================

const ai = new GoogleGenAI({});
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
  /**
   * Générer une réponse avec Gemini
   * @param {string} message - Message actuel de l'utilisateur
   * @param {Array} messages - Historique des messages
   * @param {Array} attachments - Fichiers joints
   * @param {string} conversationId - ID de la conversation
   * @param {string} systemPrompt - Prompt système personnalisé (optionnel)
   */
  async generateResponse(
    message,
    messages,
    attachments = [],
    conversationId,
    systemPrompt = null
  ) {
    try {
      const ai = getGeminiClient();

      let chat = chats.get(conversationId);
      
      if (!chat) {
        console.log("[LLM] Création nouveau chat pour conversation:", conversationId);
        
        // Convertir l'historique au format Gemini
        const history = [...messages].map((msg) => {
          return {
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
          };
        });

        // Configuration du chat avec system prompt personnalisé
        const chatConfig = {
          model: "gemini-2.5-flash-lite",
          history,
        };

        // Ajouter le system prompt si fourni
        if (systemPrompt) {
          chatConfig.config = {
            systemInstruction: systemPrompt,
          };
          console.log("[LLM] System prompt appliqué:", systemPrompt.substring(0, 100) + "...");
        }

        chat = ai.chats.create(chatConfig);
        chats.set(conversationId, chat);
      }

      // Gérer les pièces jointes
      console.log("[LLM] Attachements:", attachments.length);
      const attachmentParts = [];
      
      for (const at of attachments) {
        try {
          const file = await ai.files.upload({ file: at.path });
          if (file.mimeType != null && file.uri != null) {
            attachmentParts.push(createPartFromUri(file.uri, file.mimeType));
          }
        } catch (uploadError) {
          console.error("[LLM] Erreur upload fichier:", uploadError);
        }
      }

      // Envoyer le message avec les pièces jointes
      console.log("[LLM] Envoi message avec", attachmentParts.length, "pièces jointes");
      const response = await chat.sendMessage({
        message: createUserContent([message, ...attachmentParts]),
        config: {
          temperature: 0.7,
        },
      });

      console.log("[LLM] Réponse reçue");
      return {
        content: response.text,
        model: response.modelVersion,
        tokens: response.usageMetadata.totalTokenCount,
      };
    } catch (error) {
      console.error("[LLM] Erreur Gemini:", error);
      throw new Error("Erreur lors de la génération de la réponse");
    }
  },

  


  /**
   * Vider le cache du chat pour une conversation (appele a la suppression)
   */
  clearChatCache(conversationId) {
    if (conversationId) {
      const deleted = chats.delete(conversationId);
      console.log('[LLM] Cache chat', deleted ? 'supprime' : 'introuvable', 'pour:', conversationId);
    } else {
      chats.clear();
      console.log('[LLM] Cache chat entierement vide');
    }
  },

  deleteChatSession(conversationId) {
    this.clearChatCache(conversationId);
  },

    async generateCv({offre, poste, instructions, existing}) {

    try {
      var exisingPart = null;

      
      if(existing !== null){
        const file = await ai.files.upload({file: existing.path});
        if(file.mimeType!=null && file.uri!=null){
          exisingPart =createPartFromUri(file.uri, file.mimeType);
        }
      }
      console.log("le cv existant est",exisingPart)
      

      const response = await ai.models.generateContent({
        model:'gemini-2.5-flash', 
        config: {
          temperature: 0.7,
          systemInstruction: instructions,
          responseMimeType:'application/json',
        },
        contents: [
          createUserContent([
            `voici les informations a prendre en compte l'intitule du poste est ${poste} et l'offre est : ${offre} et le cv existant en piece jointe `,
            ...(exisingPart ? [exisingPart] : [])
          ])
        ]
      });

      return JSON.parse(response.text);
      
    } catch (error) {
      console.log("erreur gemini cv: ", error);
        throw new Error("erreur de la generation du cv")
    }
  },


  clearChatCache(conversationId = null) {
    if (conversationId) {
      chats.delete(conversationId);
      console.log(`[LLM Gemini] Chat supprimé pour conversation: ${conversationId}`);
    } else {
      chats.clear();
      console.log("[LLM Gemini] Tous les chats en cache ont été vidés");
    }
  },
};








