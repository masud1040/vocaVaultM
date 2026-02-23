
import { GoogleGenAI, Modality, Type } from "@google/genai";

const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Auto-fills vocabulary details (Meaning & Example) based on the English word
 */
export const autoFillVocabulary = async (word: string): Promise<{ meaning: string, example: string }> => {
  const ai = createAI();
  // Refined prompt for more natural Bengali sense
  const prompt = `Act as a world-class English-Bengali translator. 
  For the English word "${word}", provide:
  1. The most common and natural Bengali (Bangla) meaning used in everyday conversation. 
  2. A concise, modern English example sentence that clearly shows the word's usage.
  
  Return the response strictly in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meaning: { type: Type.STRING, description: "The most natural Bengali meaning" },
            example: { type: Type.STRING, description: "A short, high-quality English example sentence" }
          },
          required: ["meaning", "example"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      meaning: result.meaning || "",
      example: result.example || ""
    };
  } catch (error) {
    console.error("Auto-fill error:", error);
    throw new Error("AI translation failed. Please try again.");
  }
};

// PCM Decoding helpers for TTS
function decodeBase64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const audioCache: Record<string, AudioBuffer> = {};

export const speakWord = async (text: string): Promise<void> => {
  if (audioCache[text]) {
    playAudioBuffer(audioCache[text]);
    return;
  }

  const ai = createAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = decodeBase64ToUint8(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
      
      audioCache[text] = audioBuffer;
      playAudioBuffer(audioBuffer);
    }
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

const playAudioBuffer = (buffer: AudioBuffer) => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
};
