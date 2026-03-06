
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateInventoryInsight(stockData: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this inventory data and provide 3 brief professional insights for optimization: ${JSON.stringify(stockData)}`,
      config: {
        systemInstruction: "You are a professional inventory management consultant. Analyze the provided stock data and give 3 specific, actionable insights. If the data is empty or sparse, provide general best practices for inventory management in a retail context.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insights at this time.";
  }
}
