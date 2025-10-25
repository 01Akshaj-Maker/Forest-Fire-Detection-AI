
import { GoogleGenAI, Type } from '@google/genai';
import type { Detection } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: {
        type: Type.STRING,
        enum: ['FIRE', 'SMOKE'],
        description: 'The type of phenomenon detected, either FIRE or SMOKE.'
      },
      box: {
        type: Type.OBJECT,
        description: 'A bounding box in {x, y, width, height} format, normalized to [0, 1].',
        properties: {
          x: { type: Type.NUMBER, description: 'Top-left corner x-coordinate (normalized).' },
          y: { type: Type.NUMBER, description: 'Top-left corner y-coordinate (normalized).' },
          width: { type: Type.NUMBER, description: 'Width of the box (normalized).' },
          height: { type: Type.NUMBER, description: 'Height of the box (normalized).' },
        },
        required: ['x', 'y', 'width', 'height'],
      },
    },
    required: ['label', 'box'],
  },
};

const systemInstruction = `You are an expert computer vision model specializing in detecting fire and smoke in outdoor and forest environments.
Analyze the user-provided image and identify all instances of fire or smoke.
- Only identify genuine fire/smoke.
- Ignore other bright objects like sun glare, lights, or reflections.
- Return a JSON array of all detections.
- If no fire or smoke is detected, return an empty array.
- Bounding box coordinates must be normalized between 0 and 1.`;

export async function detectFireInFrame(base64Image: string): Promise<Detection[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Analyze this image for fire or smoke.' },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,
      },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
      return [];
    }
    
    const detections = JSON.parse(jsonText) as Detection[];
    
    // Validate detections
    return detections.filter(d => 
        d.label && d.box &&
        typeof d.box.x === 'number' &&
        typeof d.box.y === 'number' &&
        typeof d.box.width === 'number' &&
        typeof d.box.height === 'number'
    );

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return empty array on error to avoid crashing the whole process
    return [];
  }
}
