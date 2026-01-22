/**
 * Service pour interagir avec le LLM
 * Adaptez selon votre API (OpenAI, Anthropic, etc.)
 */

export const llmService = {
  /**
   * Générer une réponse du LLM
   * @param {Array} messages - Historique des messages [{role, content}]
   * @returns {Object} - {content, model, tokens}
   */
async generateResponse(messages) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Modèle le plus puissant gratuit
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API Error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        model: data.model,
        tokens: data.usage.total_tokens,
      };
      
    } catch (error) {
      console.error('Erreur Groq LLM:', error);
      throw new Error('Erreur lors de la génération de la réponse');
    }
  },

  /**
   * Générer un titre pour une conversation basé sur le premier message
   */
  async generateConversationTitle(firstMessage) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'Tu es un assistant qui génère des titres courts et descriptifs pour des conversations. Réponds uniquement avec le titre, sans guillemets ni ponctuation finale.'
        },
        {
          role: 'user',
          content: `Génère un titre court (max 50 caractères) pour cette conversation: "${firstMessage}"`
        }
      ];

      const response = await this.generateResponse(messages);
      return response.content.substring(0, 50).trim();
      
    } catch (error) {
      console.error('Erreur génération titre:', error);
      return 'Nouvelle conversation';
    }
  },

  /**
   * Liste des modèles Groq disponibles
   */
  getAvailableModels() {
    return [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        description: 'Le plus puissant, excellent pour les tâches complexes',
        tokensPerMinute: 30000,
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        description: 'Très rapide, bon pour les réponses simples',
        tokensPerMinute: 20000,
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Bon équilibre vitesse/qualité',
        tokensPerMinute: 15000,
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        description: 'Modèle de Google, polyvalent',
        tokensPerMinute: 15000,
      },
    ];
  },
};