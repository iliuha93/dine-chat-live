import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send, Radio, ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomTabBar from "@/components/BottomTabBar";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

const getTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const TypingIndicator = () => (
  <div className="flex justify-start animate-fade-up">
    <div className="flex items-center gap-2 max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-[hsl(var(--chat-bubble-bot))] border border-border/30">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  </div>
);

const ChatPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: t.chat.welcome, isUser: false, time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const addMessage = useCallback((text: string, isUser: boolean) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), text, isUser, time: getTime() }]);
    scrollToBottom();
  }, []);

  const simulateReply = (text: string) => {
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => { setIsTyping(false); addMessage(text, false); }, 1200);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage(trimmed, true);
    setInput("");
    simulateReply(t.chat.default_reply);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSend(); };

  const startRecording = () => {
    holdTimerRef.current = setTimeout(() => setIsRecording(true), 150);
  };

  const stopRecording = () => {
    clearTimeout(holdTimerRef.current);
    if (isRecording) {
      setIsRecording(false);
      addMessage(t.chat.voice_message, true);
      simulateReply(t.chat.voice_received);
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      <div className="ambient-orb w-64 h-64 bg-primary top-[-10%] right-[-20%]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-card-strong">
        <button onClick={() => navigate("/login")} className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-primary-foreground">LM</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">{t.common.restaurant_name}</h2>
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              <p className="text-[10px] text-primary font-medium">{t.common.ai_assistant}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button onClick={() => navigate("/live")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gold-gradient text-xs font-semibold text-primary-foreground transition-all active:scale-95 shadow-md shadow-primary/20">
            <Radio className="w-3.5 h-3.5" />
            {t.common.live}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex justify-center mb-2">
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">{t.common.today}</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex animate-fade-up ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col gap-0.5">
              <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.isUser
                  ? "bg-[hsl(var(--chat-bubble-user))] text-foreground rounded-2xl rounded-br-md border border-primary/10"
                  : "bg-[hsl(var(--chat-bubble-bot))] text-foreground rounded-2xl rounded-bl-md border border-border/30"
              }`}>
                {msg.text}
              </div>
              <span className={`text-[9px] text-muted-foreground px-1 ${msg.isUser ? "text-right" : "text-left"}`}>{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 pb-2 pt-2 border-t border-border/50 glass-card-strong">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-secondary/30 border border-border/50 rounded-2xl px-4 py-2.5 focus-within:border-primary/30 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.placeholder}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {input.trim() ? (
            <button onClick={handleSend} className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center text-primary-foreground transition-all active:scale-90 shadow-md shadow-primary/20">
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording}
              onTouchStart={startRecording} onTouchEnd={stopRecording}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                isRecording ? "bg-[hsl(var(--mic-active))] mic-pulse" : "bg-secondary/30 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <Mic className={`w-5 h-5 ${isRecording ? "text-foreground" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default ChatPage;
