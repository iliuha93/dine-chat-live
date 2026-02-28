import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Radio } from "lucide-react";

const WaveVisualizer = () => (
  <div className="flex items-center justify-center gap-1 h-8">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="w-1 bg-primary/80 rounded-full wave-bar"
        style={{
          animationDelay: `${i * 0.1}s`,
          height: "8px",
        }}
      />
    ))}
  </div>
);

const BotAvatar = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative flex flex-col items-center gap-4">
    {/* Glow rings when speaking */}
    {isSpeaking && (
      <>
        <div className="absolute w-40 h-40 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "2s", top: "-12px", left: "50%", transform: "translateX(-50%)" }} />
        <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "3s", top: "-28px", left: "50%", transform: "translateX(-50%)" }} />
      </>
    )}
    
    {/* Bot face */}
    <div className={`relative w-28 h-28 rounded-full glass-card-strong flex items-center justify-center transition-all duration-500 ${isSpeaking ? "shadow-2xl shadow-primary/30" : ""}`}>
      {/* Eyes */}
      <div className="flex gap-5 absolute top-8">
        <div className={`w-3.5 h-3.5 rounded-full bg-primary transition-all duration-300 ${isSpeaking ? "animate-pulse" : ""}`} />
        <div className={`w-3.5 h-3.5 rounded-full bg-primary transition-all duration-300 ${isSpeaking ? "animate-pulse" : ""}`} />
      </div>
      
      {/* Mouth - animates when speaking */}
      <div className="absolute bottom-7 flex items-center justify-center">
        <div 
          className={`rounded-full bg-primary/80 transition-all duration-150 ${
            isSpeaking 
              ? "w-6 bot-mouth-speaking" 
              : "w-4 h-1.5"
          }`}
          style={!isSpeaking ? {} : undefined}
        />
      </div>
    </div>
    
    {/* Name */}
    <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
      {isSpeaking ? "Говорю..." : "AI Ассистент"}
    </p>
  </div>
);

const RealtimePage = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      {/* Ambient orbs */}
      <div className={`ambient-orb w-80 h-80 transition-all duration-1000 ${isActive ? "bg-destructive opacity-[0.12]" : "bg-primary opacity-[0.1]"} top-[20%] left-[-20%]`} />
      <div className={`ambient-orb w-64 h-64 transition-all duration-1000 ${isActive ? "bg-destructive opacity-[0.08]" : "bg-primary opacity-[0.08]"} bottom-[10%] right-[-15%]`} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-card-strong">
        <button
          onClick={() => navigate("/chat")}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isActive ? "text-destructive animate-pulse" : "text-primary"}`} />
          <h2 className="text-sm font-semibold text-foreground">Режим реального времени</h2>
        </div>

        <div className="w-9" />
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-display)" }}>
            Голосовой ассистент
          </h1>
          <p className="text-sm text-muted-foreground max-w-[260px]" style={{ fontFamily: "var(--font-elegant)" }}>
            Нажмите на микрофон и говорите — ассистент ответит мгновенно
          </p>
        </div>

        {/* Bot Avatar */}
        <BotAvatar isSpeaking={isActive} />

        {/* Mic Button with rings */}
        <div className="relative">
          {isActive && (
            <>
              <div className="absolute inset-0 w-20 h-20 rounded-full border border-destructive/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute -inset-3 w-26 h-26 rounded-full border border-destructive/10 animate-ping" style={{ animationDuration: "2.5s" }} />
            </>
          )}
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isActive
                ? "bg-[hsl(var(--mic-active))] mic-pulse shadow-2xl shadow-[hsl(var(--mic-active)/0.4)]"
                : "gold-gradient shadow-xl shadow-[hsl(var(--primary)/0.3)] glow-pulse"
            }`}
          >
            {isActive ? (
              <MicOff className="w-8 h-8 text-foreground" />
            ) : (
              <Mic className="w-8 h-8 text-primary-foreground" />
            )}
          </button>
        </div>

        {/* Status text */}
        <p className="text-xs text-muted-foreground">
          {isActive ? "Слушаю... Нажмите чтобы остановить" : "Нажмите чтобы начать"}
        </p>

        {/* Waveform + Transcript */}
        {isActive && (
          <div className="w-full space-y-3 animate-fade-up">
            <WaveVisualizer />
            <div className="glass-card-strong rounded-2xl p-4">
              <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-1.5">Транскрипция</p>
              <p className="text-sm text-foreground/60 italic" style={{ fontFamily: "var(--font-elegant)" }}>
                Ожидание речи...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimePage;
