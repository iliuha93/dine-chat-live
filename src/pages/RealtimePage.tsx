import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Radio } from "lucide-react";

const RealtimePage = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-card">
        <button
          onClick={() => navigate("/chat")}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Режим реального времени</h2>
        </div>

        <div className="w-9" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gold-text">Голосовой ассистент</h1>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            Нажмите на микрофон и говорите — ассистент ответит в реальном времени
          </p>
        </div>

        {/* Mic Button */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isActive
              ? "bg-[hsl(var(--mic-active))] mic-pulse shadow-lg shadow-[hsl(var(--mic-active)/0.3)]"
              : "gold-gradient shadow-lg shadow-[hsl(var(--primary)/0.3)]"
          }`}
        >
          {isActive ? (
            <MicOff className="w-10 h-10 text-foreground" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </button>

        <p className="text-xs text-muted-foreground">
          {isActive ? "Слушаю... Нажмите чтобы остановить" : "Нажмите чтобы начать"}
        </p>

        {/* Transcript Area */}
        {isActive && (
          <div className="w-full glass-card rounded-2xl p-4 animate-fade-up">
            <p className="text-xs text-muted-foreground mb-1">Транскрипция:</p>
            <p className="text-sm text-foreground italic">Ожидание речи...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimePage;
