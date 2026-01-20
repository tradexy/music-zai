import { GoogleGenAI, Type } from "@google/genai";
import { StepData } from "../types";
import { STEPS_COUNT } from "../constants";

export const generateAcidPattern = async (description: string): Promise<StepData[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found. Returning random pattern.");
    return generateRandomFallback();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a 16-step Acid bassline sequence pattern based on this description: "${description}". 
  The sequence should be a JSON array of objects. 
  'noteIndex' should be an integer between 0 and 11. 
  'active' is boolean (true if note plays). 
  'slide' is boolean (portamento to next note).
  'accent' is boolean (louder velocity).
  Make it groovy and genre-appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              active: { type: Type.BOOLEAN },
              noteIndex: { type: Type.INTEGER },
              slide: { type: Type.BOOLEAN },
              accent: { type: Type.BOOLEAN },
            },
            required: ["active", "noteIndex", "slide", "accent"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Validate and fill missing steps
    let steps: StepData[] = rawData.slice(0, STEPS_COUNT).map((s: any) => ({
      active: !!s.active,
      noteIndex: Math.min(11, Math.max(0, s.noteIndex || 0)),
      slide: !!s.slide,
      accent: !!s.accent
    }));

    // Pad if short
    while (steps.length < STEPS_COUNT) {
      steps.push({ active: false, noteIndex: 0, slide: false, accent: false });
    }

    return steps;

  } catch (error) {
    console.error("Gemini generation failed", error);
    return generateRandomFallback();
  }
};

const generateRandomFallback = (): StepData[] => {
  return Array(STEPS_COUNT).fill(null).map(() => ({
    active: Math.random() > 0.5,
    noteIndex: Math.floor(Math.random() * 12),
    slide: Math.random() > 0.7,
    accent: Math.random() > 0.8
  }));
};
