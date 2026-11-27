// import "dotenv/config";
// // import { GoogleGenerativeAI } from '@google/generative-ai';
// import { GoogleGenAI } from "@google/genai";

// const gemini = new GoogleGenAI(process.env.GEMINI_API_KEY);

// // Call Gemini API for dream interpretation
// export async function getDreamInterpretation(dreamText) {

//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error('Server misconfigured: GEMINI_API_KEY is missing');
//   }

//   const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
//   try {
//     const generativeModel = gemini.getGenerativeModel({
//       model: model,
//       systemInstruction: 'You are a thoughtful dream interpreter. Be insightful but gentle, and consider common dream symbolism. Keep your interpretation to 2-3 paragraphs.'
//     });

//     const result = await generativeModel.generateContent(`Dream: ${dreamText}`);
//     const response = result.response;
//     return response.text().trim();
//   } catch (error) {
//     console.error('Gemini API error:', error);
//     throw new Error(`API error: ${error.message}`);
//   }
// }


import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// 1. Pass an options object (not a raw string)
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Call Gemini API for dream interpretation
export async function getDreamInterpretation(dreamText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Server misconfigured: GEMINI_API_KEY is missing");
  }

  // 2. Use current models instead of deprecated gemini-2.5-flash
  const models = [
    process.env.GEMINI_MODEL || "gemini-3.8-flash",
  ];

  const systemInstruction =
    "You are a thoughtful dream interpreter. Be insightful but gentle, and consider common dream symbolism. Keep your interpretation to 2-3 paragraphs.";

  for (const model of models) {
    try {
      // 3. Use Interactions API instead of getGenerativeModel / generateContent
      const interaction = await gemini.interactions.create({
        model,
        system_instruction: systemInstruction,
        input: `Dream: ${dreamText}`,
      });

      return interaction.output_text.trim();
    } catch (error) {
      if (error.status === 503 && model !== models[models.length - 1]) {
        console.warn(`${model} busy (503), retrying with fallback model...`);
        continue;
      }
      console.error("Gemini API error:", error);
      throw new Error(`API error: ${error.message}`);
    }
  }
}
