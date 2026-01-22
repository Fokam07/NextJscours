// test-groq.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Dis-moi bonjour en français" }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log("Réponse Groq :", completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Erreur Groq :", error.message);
  }
}

testGroq();