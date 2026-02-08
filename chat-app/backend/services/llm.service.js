/**
 * Service pour interagir avec le LLM le model IA
 * Avec support de génération de titres intelligents
 */

import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";

export const llmService = {
  /**
   * Générer une réponse du LLM
   * @param {Array} messages - Historique des messages [{role, content}]
   * @param {Array} attachments - Fichiers joints (optionnel)
   * @returns {Object} - {content, model, tokens}
   */
  async generateResponse(messages, attachments = []) {
    try {
      // Construire le contexte avec les pièces jointes si présentes
      let enrichedMessages = [...messages];

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
            temperature: 0.5, // Moins créatif pour plus de cohérence
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
    // Nettoyer le message
    const cleaned = message.trim();

    // Prendre les 5 premiers mots
    const words = cleaned.split(/\s+/).slice(0, 5);
    let title = words.join(" ");

    // Limiter à 50 caractères
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title || "Nouvelle conversation";
  },

  /**
   * Liste des modèles Groq disponibles avec leurs caractéristiques
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

  /**
   * Estimer le nombre de tokens dans un texte
   * (Approximation: 1 token ≈ 4 caractères en français)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  },

  /**
   * Vérifier si un modèle peut gérer un contexte donné
   */
  canHandleContext(modelId, messages) {
    const model = this.getAvailableModels().find((m) => m.id === modelId);
    if (!model) return false;

    const totalText = messages.map((m) => m.content).join(" ");
    const estimatedTokens = this.estimateTokens(totalText);

    return estimatedTokens < model.maxTokens * 0.8; // Garder 20% de marge
  },
};

const ai = new GoogleGenAI({});
const chats = new Map();

export const llmServicer = {
  async generateResponse(
    message,
    messages,
    attachments = [],
    conversationId,
  ) {
    try {
      let chat = chats.get(conversationId);
      if (!chat) {
        console.log("cha est null", conversationId, chats)
        const history = [...messages].map((message) => {
          return {
            role: message.role === 'assistant' ? 'model' : message.role,
            parts: [{ text: message.content }],
          };
        });
        chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history
      });
      chats.set(conversationId, chat);
      } 

      console.log("attachements", attachments);
      const attachmentParts = [];
      for(const at of attachments){
        const file = await ai.files.upload({file: at.path});
        if(file.mimeType!=null && file.uri!=null){
          attachmentParts.push(createPartFromUri(file.uri, file.mimeType));
        }
      }
      console.log("part union",[message, ...attachmentParts ] );
      const response = await chat.sendMessage({
        message: createUserContent([message, ...attachmentParts ]) ,
        config: {
          temperature: 0.7,
        },
      });

      console.log("la repose est: ", response);
      return {
        content: response.text,
        nodel: response.modelVersion,
        tokens: response.usageMetadata.totalTokenCount
      };

    } catch (error) {
     console.error("Erreur gemini LLM:", error);
      throw new Error("Erreur lors de la génération de la réponse");
    }
  },
};



