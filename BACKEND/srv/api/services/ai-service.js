import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export async function getAISolution(errorMessage, context = "") {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Eres un asistente técnico experto en depuración de software.
      El siguiente error ocurrió:
      "${errorMessage}"
      Contexto adicional: ${context || "N/A"}.
      Explica cuál podría ser la causa y cómo solucionarlo de forma clara.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { success: true, aiResponse: text };
  } catch (err) {
    console.error("❌ Error generando respuesta IA:", err);
    return { success: false, aiResponse: "No se pudo generar una respuesta automática." };
  }
}
