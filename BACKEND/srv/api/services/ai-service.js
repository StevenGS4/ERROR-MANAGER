import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export async function getAISolution(error) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 👈 MODELO CORREGIDO
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Eres un asistente técnico experto en depuración de software.
      El siguiente error ocurrió:
      "${error?.ERRORMESSAGE || error}"
      
      Contexto adicional:
      ${JSON.stringify(error, null, 2)}

      Explica la causa probable y cómo solucionarlo de forma clara. 
      Que tu respuesta sea con una longitud de hasta 4900 caracteres
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const plain = text
      .replace(/[*_`#>-]/g, "") // quita símbolos markdown comunes
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // quita links [text](url)
      .replace(/!\[(.*?)\]\((.*?)\)/g, "") // quita imágenes ![](url)
      .replace(/^\s*-\s*/gm, "") // quita viñetas "-"
      .replace(/^\s*\*\s*/gm, "") // quita viñetas "*"
      .replace(/\n{2,}/g, "\n") // compacta saltos de línea
      .trim();

    return { success: true, aiResponse: plain.slice(0,4999)};
  } catch (err) {
    console.error("❌ Error generando respuesta IA:", err);
    return {
      success: false,
      aiResponse: "No se pudo generar una respuesta automática con la IA.",
    };
  }
}
