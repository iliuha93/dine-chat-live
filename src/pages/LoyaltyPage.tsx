import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import BottomTabBar from "@/components/BottomTabBar";

const levels = [
  { name: "Bronze", threshold: 0, done: true },
  { name: "Silver", threshold: 500, done: true },
  { name: "Gold", threshold: 1000, current: true },
  { name: "Platinum", threshold: 2000 },
];

const history = [
  { points: 50, desc: "Заказ #1247", date: "Сегодня" },
  { points: 35, desc: "Заказ #1230", date: "Вчера" },
  { points: 120, desc: "Заказ #1215", date: "28.02" },
];

const rewards = [
  { name: "Бесплатный десерт", cost: 500 },
  { name: "Скидка 10%", cost: 800 },
];

const LoyaltyPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentPoints = 1250;
  const progress = ((currentPoints - 1000) / (2000 - 1000)) * 100;

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      <div className="ambient-orb w-64 h-64 bg-primary top-[-10%] right-[-20%]" />

      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-card-strong">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{t.loyalty.title}</h2>
        <div className="w-9" />
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Current level card */}
        <div className="glass-card rounded-2xl p-5 border border-primary/20 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-primary fill-primary" />
            <span className="text-2xl font-bold gold-text" style={{ fontFamily: "var(--font-display)" }}>Gold</span>
          </div>
          <p className="text-4xl font-bold text-foreground">{currentPoints.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{t.loyalty.points}</span></p>
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>До Platinum: 750 {t.loyalty.points}</span>
            </div>
          </div>
          <span className="inline-block text-xs font-bold gold-gradient text-primary-foreground px-3 py-1 rounded-full">{t.loyalty.multiplier}: x1.5</span>
        </div>

        {/* Levels */}
        <div>
          <SectionTitle text={t.loyalty.levels} />
          <div className="space-y-2">
            {levels.map((l) => (
              <div key={l.name} className="flex items-center gap-3 py-1.5">
                {l.done ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : l.current ? (
                  <Star className="w-4 h-4 text-primary fill-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                )}
                <span className={`text-sm ${l.current ? "font-bold text-foreground" : l.done ? "text-foreground" : "text-muted-foreground"}`}>{l.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{l.threshold} {t.loyalty.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <SectionTitle text={t.loyalty.recent} />
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-500">+{h.points}</span>
                  <span className="text-sm text-foreground">{h.desc}</span>
                </div>
                <span className="text-xs text-muted-foreground">{h.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div>
          <SectionTitle text={t.loyalty.rewards} />
          <div className="space-y-2">
            {rewards.map((r) => (
              <div key={r.name} className="glass-card rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.cost} {t.loyalty.points}</p>
                </div>
                <button className="px-4 py-1.5 rounded-full gold-gradient text-xs font-semibold text-primary-foreground transition-all active:scale-95">
                  {t.loyalty.claim}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

const SectionTitle = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="flex-1 h-px bg-border/50" />
    <span className="text-[11px] text-primary font-medium uppercase tracking-wider">{text}</span>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

export default LoyaltyPage;
