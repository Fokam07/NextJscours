/**
 * Service pour interagir avec le LLM le model IA
 * Avec support de génération de titres intelligents et system prompts personnalisés
 */

import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";

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
      // Construire le contexte avec les pièces jointes si présentes
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

  /**
   * Générer un titre intelligent pour une conversation
   * Basé sur le premier message de l'utilisateur
   * @param {string} firstMessage - Premier message de la conversation
   * @returns {string} - Titre généré (max 50 caractères)
   */
  async generateConversationTitle(firstMessage) {
    try {
      // Nettoyer et limiter le message
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
          content: `Génère un titre court (3-6 mots) pour cette conversation:\n\n"${cleanMessage}"`,
        },
      ];

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
            messages: messages,
            temperature: 0.5,
            max_tokens: 50,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur API Groq");
      }

      const data = await response.json();
      let title = data.choices[0].message.content.trim();

      // Nettoyer le titre
      title = title
        .replace(/^["']|["']$/g, "") // Retirer les guillemets
        .replace(/\.$/, "") // Retirer le point final
        .substring(0, 50); // Limiter à 50 caractères

      return title || this.generateSimpleTitle(firstMessage);
    } catch (error) {
      console.error("Erreur génération titre:", error);
      return this.generateSimpleTitle(firstMessage);
    }
  },

  /**
   * Générer un titre simple en cas d'échec de l'IA
   * Basé sur les premiers mots du message
   * @param {string} message - Message original
   * @returns {string} - Titre simple
   */
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
    return Math.ceil(text.length / 4);
  },

  canHandleContext(modelId, messages) {
    const model = this.getAvailableModels().find((m) => m.id === modelId);
    if (!model) return false;

    const totalText = messages.map((m) => m.content).join(" ");
    const estimatedTokens = this.estimateTokens(totalText);

    return estimatedTokens < model.maxTokens * 0.8;
  },

  // async generateCv({offre, poste, exist}) {
  //   try{

    

  // }
};

// ==================== GEMINI SERVICE ====================

const ai = new GoogleGenAI({});
const chats = new Map();

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
          model: "gemini-2.0-flash-exp",
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
   * Invalider le cache d'un chat (utile si le rôle change)
   */
  clearChatCache(conversationId) {
    if (chats.has(conversationId)) {
      chats.delete(conversationId);
      console.log("[LLM] Cache chat supprimé pour:", conversationId);
    }
  },

  /**
   * Obtenir les statistiques des chats en cache
   */
  getCacheStats() {
    return {
      activeChatCount: chats.size,
      conversationIds: Array.from(chats.keys()),
    };
  },
};