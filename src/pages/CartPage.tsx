import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/store/CartContext";
import BottomTabBar from "@/components/BottomTabBar";

const CartPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { items, updateQty, removeItem, comment, setComment } = useCart();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  if (items.length === 0) {
    return (
      <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
        <div className="ambient-orb w-64 h-64 bg-primary top-[-10%] right-[-20%]" />
        <header className="relative z-10 flex items-center justify-center px-4 py-3 border-b border-border/50 glass-card-strong">
          <h2 className="text-lg font-semibold text-foreground">{t.cart.title}</h2>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <ShoppingCart className="w-16 h-16 text-muted-foreground" />
          <p className="text-lg text-muted-foreground font-medium">{t.cart.empty}</p>
          <p className="text-sm text-muted-foreground">{t.cart.empty_hint}</p>
          <button onClick={() => navigate("/menu")} className="mt-4 px-6 py-3 rounded-2xl gold-gradient text-primary-foreground font-semibold text-sm transition-all active:scale-95 shadow-xl shadow-primary/20">
            {t.cart.go_to_menu}
          </button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      <div className="ambient-orb w-64 h-64 bg-primary top-[-10%] right-[-20%]" />

      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 glass-card-strong">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{t.cart.title}</h2>
        <div className="w-9" />
      </header>

      {/* Table badge */}
      <div className="relative z-10 flex justify-center py-3">
        <span className="flex items-center gap-1.5 glass-card rounded-full px-4 py-1.5 text-xs text-primary font-medium">
          <MapPin className="w-3.5 h-3.5" /> {t.cart.table} #7
        </span>
      </div>

      {/* Items */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {items.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl p-3 flex gap-3">
            {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded-lg glass-card flex items-center justify-center">
                  <Minus className="w-3 h-3 text-foreground" />
                </button>
                <span className="text-sm font-bold text-foreground w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded-lg glass-card flex items-center justify-center">
                  <Plus className="w-3 h-3 text-foreground" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className="text-sm font-bold text-primary">{item.price * item.qty}</span>
              <button onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Comment */}
        <div className="glass-card rounded-2xl p-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.cart.comment}
            rows={2}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-2">
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-sm text-muted-foreground"><span>{t.cart.subtotal}</span><span>{subtotal} {t.common.currency}</span></div>
          <div className="flex justify-between text-sm text-muted-foreground"><span>{t.cart.service} (10%)</span><span>{service} {t.common.currency}</span></div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-lg font-bold"><span className="text-foreground">{t.cart.total}</span><span className="text-primary">{total} {t.common.currency}</span></div>
        </div>
      </div>

      {/* Checkout */}
      <div className="relative z-10 px-4 pb-2 pt-3 border-t border-border/50 glass-card-strong">
        <button
          onClick={() => navigate("/order-confirmation")}
          className="w-full h-[52px] rounded-2xl gold-gradient flex items-center justify-center text-primary-foreground font-semibold text-base transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          {t.cart.checkout} — {total} {t.common.currency}
        </button>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default CartPage;
