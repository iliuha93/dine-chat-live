import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Radio, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useOpenAIChat } from "@/hooks/useOpenAIChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";

const langMap: Record<string, string> = {
  RU: "ru-RU",
  RO: "ro-RO",
  EN: "en-US",
};

const WaveVisualizer = ({ active }: { active: boolean }) => (
  <div className="flex items-center justify-center gap-1 h-8">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full transition-all duration-150 ${
          active ? "bg-primary/80 wave-bar" : "bg-primary/30"
        }`}
        style={{
          animationDelay: `${i * 0.1}s`,
          height: active ? "8px" : "4px",
        }}
      />
    ))}
  </div>
);

const BotAvatar = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative flex flex-col items-center gap-4">
    {isSpeaking && (
      <>
        <div
          className="absolute w-40 h-40 rounded-full border border-primary/20 animate-ping"
          style={{ animationDuration: "2s", top: "-12px", left: "50%", transform: "translateX(-50%)" }}
        />
        <div
          className="absolute w-48 h-48 rounded-full border border-primary/10 animate-ping"
          style={{ animationDuration: "3s", top: "-28px", left: "50%", transform: "translateX(-50%)" }}
        />
      </>
    )}
    <div
      className={`relative w-28 h-28 rounded-full glass-card-strong flex items-center justify-center transition-all duration-500 ${
        isSpeaking ? "shadow-2xl shadow-primary/30" : ""
      }`}
    >
      <div className="flex gap-5 absolute top-8">
        <div className={`w-3.5 h-3.5 rounded-full bg-primary transition-all duration-300 ${isSpeaking ? "animate-pulse" : ""}`} />
        <div className={`w-3.5 h-3.5 rounded-full bg-primary transition-all duration-300 ${isSpeaking ? "animate-pulse" : ""}`} />
      </div>
      <div className="absolute bottom-7 flex items-center justify-center">
        <div
          className={`rounded-full bg-primary/80 transition-all duration-150 ${
            isSpeaking ? "w-6 bot-mouth-speaking" : "w-4 h-1.5"
          }`}
        />
      </div>
    </div>
  </div>
);

const RealtimePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { messages, isTyping, sendMessage } = useOpenAIChat();

  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [displayedTranscript, setDisplayedTranscript] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const lastBotMessageRef = useRef<string>("");

  const speakText = useCallback(
    (text: string) => {
      if (!ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[lang] ?? "ru-RU";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => setIsBotSpeaking(true);
      utterance.onend = () => setIsBotSpeaking(false);
      utterance.onerror = () => setIsBotSpeaking(false);
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, lang]
  );

  useEffect(() => {
    const botMessages = messages.filter((m) => !m.isUser);
    if (botMessages.length === 0) return;
    const latest = botMessages[botMessages.length - 1];
    if (latest.text !== lastBotMessageRef.current) {
      lastBotMessageRef.current = latest.text;
      setBotResponse(latest.text);
      speakText(latest.text);
    }
  }, [messages, speakText]);

  const handleTranscript = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setDisplayedTranscript(text);
      window.speechSynthesis?.cancel();
      setIsBotSpeaking(false);
      sendMessage(text);
    },
    [sendMessage]
  );

  const { status: voiceStatus, interimTranscript, error: voiceError, isSupported, startListening, stopListening } =
    useVoiceInput({ lang, onTranscript: handleTranscript });

  const isListening = voiceStatus === "listening";
  const isProcessing = voiceStatus === "processing" || isTyping;

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setDisplayedTranscript("");
      setBotResponse("");
      startListening();
    }
  };

  const toggleTts = () => {
    if (isBotSpeaking) {
      window.speechSynthesis?.cancel();
      setIsBotSpeaking(false);
    }
    setTtsEnabled((v) => !v);
  };

  const statusLabel = () => {
    if (isListening) return t.live.listening;
    if (isProcessing) return t.chat.processing;
    if (isBotSpeaking) return t.live.speaking;
    return t.live.tap_to_start;
  };

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      <div
        className={`ambient-orb w-80 h-80 transition-all duration-1000 ${
          isListening ? "bg-destructive opacity-[0.12]" : "bg-primary opacity-[0.1]"
        } top-[20%] left-[-20%]`}
      />
      <div
        className={`ambient-orb w-64 h-64 transition-all duration-1000 ${
          isListening ? "bg-destructive opacity-[0.08]" : "bg-primary opacity-[0.08]"
        } bottom-[10%] right-[-15%]`}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-card-strong">
        <button
          onClick={() => navigate("/chat")}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isListening ? "text-destructive animate-pulse" : "text-primary"}`} />
          <h2 className="text-sm font-semibold text-foreground">{t.live.title}</h2>
        </div>

        <button
          onClick={toggleTts}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          title={ttsEnabled ? "Выключить озвучку" : "Включить озвучку"}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center space-y-2">
          <h1
            className="text-3xl font-bold gold-text"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.live.heading}
          </h1>
          <p
            className="text-sm text-muted-foreground max-w-[260px]"
            style={{ fontFamily: "var(--font-elegant)" }}
          >
            {t.live.description}
          </p>
        </div>

        <BotAvatar isSpeaking={isBotSpeaking} />

        {/* Mic button */}
        <div className="relative">
          {isListening && (
            <>
              <div
                className="absolute inset-0 w-20 h-20 rounded-full border border-destructive/20 animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute -inset-3 rounded-full border border-destructive/10 animate-ping"
                style={{ width: "104px", height: "104px", top: "-12px", left: "-12px", animationDuration: "2.5s" }}
              />
            </>
          )}
          <button
            onClick={isSupported ? toggleListening : undefined}
            disabled={!isSupported || isProcessing}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? "bg-[hsl(var(--mic-active))] mic-pulse shadow-2xl shadow-[hsl(var(--mic-active)/0.4)]"
                : "gold-gradient shadow-xl shadow-[hsl(var(--primary)/0.3)] glow-pulse"
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-foreground" />
            ) : (
              <Mic className="w-8 h-8 text-primary-foreground" />
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">{statusLabel()}</p>

        {!isSupported && (
          <p className="text-xs text-destructive text-center px-4">
            Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Safari.
          </p>
        )}

        {voiceError && (
          <p className="text-xs text-destructive text-center px-4">{voiceError}</p>
        )}

        {/* Transcription card */}
        {(isListening || displayedTranscript || botResponse || isProcessing) && (
          <div className="w-full space-y-3 animate-fade-up">
            {isListening && <WaveVisualizer active={isListening} />}

            {/* User speech */}
            {(isListening || displayedTranscript) && (
              <div className="glass-card-strong rounded-2xl p-4">
                <p className="text-[10px] text-destructive font-medium uppercase tracking-wider mb-1.5">
                  {t.live.transcription}
                </p>
                <p className="text-sm text-foreground/80" style={{ fontFamily: "var(--font-elegant)" }}>
                  {isListening
                    ? interimTranscript || <span className="italic text-foreground/40">{t.live.waiting}</span>
                    : displayedTranscript}
                </p>
              </div>
            )}

            {/* Bot response */}
            {(botResponse || isProcessing) && (
              <div className="glass-card-strong rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <p className="text-[10px] text-primary font-medium uppercase tracking-wider">
                    {t.live.ai_assistant}
                  </p>
                  {isBotSpeaking && (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-primary typing-dot"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {isProcessing && !botResponse ? (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary typing-dot"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground/80" style={{ fontFamily: "var(--font-elegant)" }}>
                    {botResponse}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimePage;
