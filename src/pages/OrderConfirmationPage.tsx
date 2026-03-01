import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/store/CartContext";
import { useEffect, useRef } from "react";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalWithService = total + Math.round(total * 0.1);
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-background max-w-md mx-auto px-6 overflow-hidden">
      <div className="ambient-orb w-72 h-72 bg-primary top-[-5%] left-[-10%]" />
      <div className="ambient-orb w-96 h-96 bg-primary bottom-[-15%] right-[-15%]" />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full">
        {/* Check icon */}
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center shadow-xl animate-scale-bounce">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>

        <h1 className="text-[28px] font-bold text-foreground animate-fade-up">{t.order.confirmed}</h1>

        <div className="w-full glass-card rounded-2xl p-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <Row label={t.order.number} value="#1247" bold />
          <Row label={t.order.table} value="#7" />
          <Row label={t.order.wait_time} value="~20 мин" />
          <Row label={t.order.amount} value={`${totalWithService || 781} ${t.common.currency}`} bold />
        </div>

        <p className="text-sm text-muted-foreground text-center animate-fade-up" style={{ animationDelay: "0.2s", fontFamily: "var(--font-elegant)" }}>
          {t.order.waiter_notified}
        </p>

        <div className="w-full flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <button onClick={() => navigate("/chat")} className="w-full h-12 rounded-2xl gold-gradient flex items-center justify-center text-primary-foreground font-semibold transition-all active:scale-95 shadow-xl shadow-primary/20">
            {t.order.back_to_chat}
          </button>
          <button onClick={() => navigate("/menu")} className="w-full h-12 rounded-2xl border border-border/50 flex items-center justify-center text-muted-foreground font-medium transition-all hover:text-foreground hover:border-primary/30 active:scale-95">
            {t.order.view_menu}
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm ${bold ? "font-bold text-primary" : "text-foreground"}`}>{value}</span>
  </div>
);

export default OrderConfirmationPage;
