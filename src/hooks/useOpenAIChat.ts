import { useState, useCallback, useRef } from "react";
import { dishes } from "@/data/menuData";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? "";
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL ?? "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

type OpenAIRole = "system" | "user" | "assistant";

interface OpenAIMessage {
  role: OpenAIRole;
  content: string;
}

const getTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const buildSystemPrompt = (): string => {
  const menuText = dishes
    .map(
      (d) =>
        `- ${d.name} / ${d.nameRo} / ${d.nameEn} — €${d.price.toFixed(2)}, ${d.weight}, ${d.prepTime} мин. Состав: ${d.ingredients.join(", ")}${d.allergens?.length ? `. Аллергены: ${d.allergens.join(", ")}` : ""}`
    )
    .join("\n");

  return `Ты — приветливый AI-ассистент ресторана Liechtensteinhaus на горнолыжном курорте Земмеринг (Semmering), Австрия. Ресторан основан в 1977 году.

СТИЛЬ ОБЩЕНИЯ:
- Тёплый, дружелюбный, горный-уютный тон
- Короткие, чёткие ответы (2–4 предложения, если не просят подробнее)
- Используй язык собеседника: если пишут на русском — отвечай по-русски, на румынском — по-румынски, на немецком — по-немецки, на английском — по-английски
- Можешь добавлять 1 эмодзи в конце ответа для уюта
- Названия блюд можно упоминать на немецком (они так и называются в меню)

ТВОИ ЗАДАЧИ:
1. Рассказывать о меню, ингредиентах, аллергенах, времени приготовления
2. Рекомендовать блюда под запрос гостя (вкус, диета, бюджет)
3. Помогать с выбором, добавлением в заказ
4. Отвечать на вопросы о ресторане (часы работы, бронирование — говори, что уточнишь у персонала)
5. Принимать голосовые и текстовые сообщения одинаково
6. При вопросе о хитах — рекомендуй Wiener Schnitzel, Germknödel, Kaiserschmarrn, Aperol Spritzer

НЕ ДЕЛАЙ:
- Не выходи за тему ресторана и еды
- Не выдумывай позиции меню вне списка ниже

АКТУАЛЬНОЕ МЕНЮ РЕСТОРАНА:
${menuText}

Валюта: EUR (евро, €). Ресторан расположен на горнолыжном курорте Земмеринг (Semmering), Австрия.`;
};

const SYSTEM_PROMPT = buildSystemPrompt();

export const useOpenAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const historyRef = useRef<OpenAIMessage[]>([]);

  const addMessage = useCallback((text: string, isUser: boolean): ChatMessage => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      text,
      isUser,
      time: getTime(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const sendMessage = useCallback(
    async (userText: string): Promise<void> => {
      addMessage(userText, true);

      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: userText },
      ];

      setIsTyping(true);

      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...historyRef.current,
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
        }

        const data = await response.json();
        const assistantText: string =
          data.choices?.[0]?.message?.content?.trim() ?? "Извините, произошла ошибка.";

        historyRef.current = [
          ...historyRef.current,
          { role: "assistant", content: assistantText },
        ];

        addMessage(assistantText, false);
      } catch (error) {
        const errorText =
          error instanceof Error
            ? `Ошибка: ${error.message}`
            : "Не удалось получить ответ. Проверьте подключение.";
        addMessage(errorText, false);
        historyRef.current = historyRef.current.slice(0, -1);
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage]
  );

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setMessages([]);
  }, []);

  return { messages, isTyping, sendMessage, clearHistory };
};
