import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send, Radio, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const WELCOME_MSG: Message = {
  id: "welcome",
  text: "Добро пожаловать в La Maison! 🍽️ Чем могу помочь? Могу рассказать о меню, забронировать столик или принять заказ.",
  isUser: false,
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const addMessage = useCallback((text: string, isUser: boolean) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isUser },
    ]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage(trimmed, true);
    setInput("");

    // Simulate bot reply
    setTimeout(() => {
      addMessage("Спасибо за ваш вопрос! Наш ассистент скоро ответит. 😊", false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const startRecording = () => {
    holdTimerRef.current = setTimeout(() => {
      setIsRecording(true);
    }, 150);
  };

  const stopRecording = () => {
    clearTimeout(holdTimerRef.current);
    if (isRecording) {
      setIsRecording(false);
      addMessage("🎤 Голосовое сообщение...", true);
      setTimeout(() => {
        addMessage("Я получил ваше голосовое сообщение. Обрабатываю...", false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-card sticky top-0 z-10">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">LM</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-tight">La Maison</h2>
            <p className="text-[10px] text-muted-foreground">Онлайн</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/realtime")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gold-gradient text-xs font-semibold text-primary-foreground transition-all active:scale-95"
        >
          <Radio className="w-3.5 h-3.5" />
          Live
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-fade-up ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                msg.isUser
                  ? "bg-[hsl(var(--chat-bubble-user))] text-foreground rounded-br-md"
                  : "bg-[hsl(var(--chat-bubble-bot))] text-foreground rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-card border border-border rounded-2xl px-4 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {input.trim() ? (
            <button
              onClick={handleSend}
              className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center text-primary-foreground transition-all active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                isRecording
                  ? "bg-[hsl(var(--mic-active))] mic-pulse"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <Mic className={`w-5 h-5 ${isRecording ? "text-foreground" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
