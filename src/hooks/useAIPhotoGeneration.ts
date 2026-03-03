import { useState } from "react";
import { Dish } from "@/data/menuData";
import { saveRemotePhotoToBucket } from "@/hooks/useDishPhotos";

interface UseAIPhotoGenerationResult {
  generate: (dish: Dish, styleHint?: string) => Promise<string>;
  generating: boolean;
  error: string | null;
}

/**
 * Build a DALL-E 3 prompt from a dish object and an optional venue/style hint.
 * The prompt targets a dark, moody restaurant aesthetic consistent with the ILAI app design.
 */
function buildPrompt(dish: Dish, styleHint?: string): string {
  const base =
    `Professional food photography of "${dish.nameEn}", ` +
    `${dish.descriptionEn}. ` +
    `Served on an elegant dark plate, overhead or 45-degree angle shot, ` +
    `dark moody restaurant lighting, shallow depth of field, ` +
    `rich colors, steam or condensation where appropriate, ` +
    `4K ultra-detailed, no text, no watermarks.`;

  return styleHint ? `${base} Style inspired by: ${styleHint}.` : base;
}

export function useAIPhotoGeneration(): UseAIPhotoGenerationResult {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a DALL-E 3 image for the given dish, save it to Supabase Storage,
   * and return the final public URL.
   *
   * @param dish        - The menu item to illustrate
   * @param styleHint   - Optional description of venue/atmosphere uploaded by the owner
   */
  const generate = async (dish: Dish, styleHint?: string): Promise<string> => {
    setGenerating(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error("VITE_OPENAI_API_KEY is not set");

      const prompt = buildPrompt(dish, styleHint);

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `OpenAI error ${response.status}`);
      }

      const json = await response.json();
      const temporaryUrl: string = json.data[0].url;

      // Persist to Supabase Storage so the URL doesn't expire
      const permanentUrl = await saveRemotePhotoToBucket(dish.id, temporaryUrl);
      return permanentUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating, error };
}
