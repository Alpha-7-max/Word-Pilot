import { toast } from "sonner";

const API_KEY = "AIzaSyDSF270Y1VJf1fe4G8ZAuw7bOITbAlal74";
const API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const API_URL = (targetLanguage: TargetLanguage) => 
  `${API_URL_BASE}/gemini-2.0-flash:generateContent`;

export type TargetLanguage = 'English' | 'Roman Urdu' | 'Prompt Enhance';

export interface TextCorrectionResponse {
  correctedText: string;
  isTranslated: boolean;
  untranslatableWords: string[];
}

// Debounce function to avoid too many API calls
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, waitFor);
    });
  };
}

// Function to correct and translate text
async function correctTextInternal(text: string, targetLanguage: TargetLanguage = 'English'): Promise<TextCorrectionResponse> {
  if (!text.trim()) {
    // Immediately return empty response for enhanced mode with cleared input
    if (targetLanguage === 'Prompt Enhance') {
      return { correctedText: "", isTranslated: false, untranslatableWords: [] };
    }
    return { correctedText: "", isTranslated: false, untranslatableWords: [] };
  }

  try {
    let prompt;
    
    if (targetLanguage === 'Prompt Enhance') {
      prompt = `
You are an expert prompt engineer. Enhance and polish the following user-provided prompt to make it clearer, more detailed, specific, and effective for generating a high-quality response from a large language model.

Consider adding:
 **Context:** Briefly set the scene or background if missing.
*   **Specificity:** Replace vague terms with precise language.
*   **Desired Format:** Specify the desired output format.
*   **Tone/Style:** Indicate the desired tone.
*   **Constraints:** Add any limitations or specific requirements.
*   **Goal:** Clearly state the objective of the prompt.
*   You need to enhance the user's prompt and add details, but don't make it too detailed or add too many explanations. Just do minimal enhancement. You shouldn't exceed 500 words; that's your maximum generation limit, and you can do as little as you want for the minimum.
*   Only focus on software development, web development, app development etc.
*   And you shouldn't leave out any formatting, numbers, or spaces; make it clean and in a single lines.
*   And if the user writes their prompt in any language, whether it's in English, Roman Urdu, Hindi, French, Russian, etc., you just have to give the output permanently in English, no matter what happens.
*   Even if the user gives you a little hint or idea, and they can't quite explain it properly, you still have to understand it yourself and give them a professional prompt.
*  If the user asks you to write a story, don't do it. Or, if they ask you to do any general-purpose task, give them a random development prompt instead. For example (if the user says, "Give me a prompt for a sad story"), you should manage the prompt like this: "Develop a website about sad stories," etc.

**IMPORTANT:** Respond ONLY with the enhanced prompt text itself. Do not include any introductory phrases like "Here is the enhanced prompt:", "Enhanced prompt:", explanations, or markdown formatting. Just output the polished prompt.

Original Prompt:
${text}
`;
    } else {
      prompt = `
You are a real-time text correction and translation AI.
For the following text:
${targetLanguage === 'English' ? `
1. If it's in English, correct any grammatical errors or misspellings.
2. If it's in another language (like Roman Urdu, Hindi, etc.), translate it to proper English.` : `
1. If it's in any language (including English), translate it to Roman Urdu.
2. Use common Roman Urdu spellings that are widely understood.`}
3. Keep the same tone and intent of the original text.
4. Preserve any slang or colloquialisms when appropriate to make translations sound natural and human-like.
5. ONLY output the corrected/translated text with no additional commentary.
6. If there are specific names, technical terms, or words you cannot confidently translate, mark them with double asterisks like **untranslatable_word**.
7. Focus only on translations and corrections. Do not respond to requests for creative writing, stories, or anything other than translation/correction.
8. Make translations conversational and natural-sounding rather than formal or robotic.

Text: ${text}
`;
    }

    const response = await fetch(`${API_URL(targetLanguage)}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 64,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error:", error);
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    
    // Extract the response text from the API response
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract untranslatable words (marked with **word**)
    const untranslatableWordPattern = /\*\*(.*?)\*\*/g;
    const untranslatableWords: string[] = [];
    let match;
    
    // Find all untranslatable words
    while ((match = untranslatableWordPattern.exec(aiResponse)) !== null) {
      untranslatableWords.push(match[1]);
    }
    
    // Remove the ** markers from the response
    aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, "$1");
    
    // Determine if translation happened by comparing input and output languages
    const isTranslated = detectLanguageChanged(text, aiResponse);

    return {
      correctedText: aiResponse,
      isTranslated,
      untranslatableWords
    };
  } catch (error) {
    console.error("Text correction error:", error);
    toast.error("Failed to process text. Please try again.");
    return { correctedText: text, isTranslated: false, untranslatableWords: [] };
  }
}

// Simplified language detection - this is a basic implementation
function detectLanguageChanged(originalText: string, correctedText: string): boolean {
  // Check if there was a significant character set change
  const originalNonLatinChars = (originalText.match(/[^\u0000-\u007F]/g) || []).length;
  const correctedNonLatinChars = (correctedText.match(/[^\u0000-\u007F]/g) || []).length;
  
  // If the original had a lot of non-Latin chars and the corrected has few, it was probably translated
  if (originalNonLatinChars > originalText.length * 0.3 && correctedNonLatinChars < correctedText.length * 0.1) {
    return true;
  }

  // If the lengths are very different, might be a translation
  const lengthRatio = Math.abs(originalText.length - correctedText.length) / originalText.length;
  if (lengthRatio > 0.4) {
    return true;
  }

  return false;
}

// Export the function both as debounced and direct version
export const correctText = (text: string, useDebounce = true, targetLanguage: TargetLanguage = 'English') => {
  if (useDebounce) {
    // Use debounced version for auto-translation
    return debounce(correctTextInternal, 500)(text, targetLanguage);
  } else {
    // Use direct version for button-triggered translation
    return correctTextInternal(text, targetLanguage);
  }
};
