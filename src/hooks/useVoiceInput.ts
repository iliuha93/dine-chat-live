import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceStatus = "idle" | "listening" | "processing";

interface UseVoiceInputOptions {
  lang?: string;
  onTranscript?: (text: string) => void;
  continuous?: boolean;
}

const langMap: Record<string, string> = {
  RU: "ru-RU",
  RO: "ro-RO",
  EN: "en-US",
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as Record<string, unknown>).SpeechRecognition as
      | (new () => SpeechRecognitionInstance)
      | undefined ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition as
      | (new () => SpeechRecognitionInstance)
      | undefined ??
    null
  );
};

export const useVoiceInput = ({
  lang = "RU",
  onTranscript,
  continuous = false,
}: UseVoiceInputOptions = {}) => {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSupported = !!getSpeechRecognition();

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Safari.");
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[lang] ?? "ru-RU";
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        const cleaned = final.trim();
        setTranscript(cleaned);
        setInterimTranscript("");
        if (!continuous) {
          onTranscript?.(cleaned);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        setError("Речь не обнаружена. Попробуйте ещё раз.");
      } else if (event.error === "not-allowed") {
        setError("Доступ к микрофону запрещён. Разрешите в настройках браузера.");
      } else {
        setError(`Ошибка распознавания: ${event.error}`);
      }
      setStatus("idle");
    };

    recognition.onend = () => {
      setStatus("idle");
      setInterimTranscript("");
      if (continuous && transcript) {
        onTranscript?.(transcript);
      }
    };

    recognitionRef.current = recognition;
    setError(null);
    setTranscript("");
    setInterimTranscript("");

    try {
      recognition.start();
      setStatus("listening");
    } catch {
      setError("Не удалось запустить микрофон.");
    }
  }, [lang, continuous, onTranscript, transcript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("processing");
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setStatus("idle");
  }, []);

  return {
    status,
    transcript,
    interimTranscript,
    error,
    isSupported,
    isListening: status === "listening",
    startListening,
    stopListening,
    reset,
  };
};
