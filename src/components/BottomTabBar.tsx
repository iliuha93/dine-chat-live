import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, UtensilsCrossed, ShoppingCart, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/store/CartContext";

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);

  const tabs = [
    { icon: MessageCircle, label: t.tabs.chat, path: "/chat" },
    { icon: UtensilsCrossed, label: t.tabs.menu, path: "/menu" },
    { icon: ShoppingCart, label: t.tabs.cart, path: "/cart", badge: count },
    { icon: User, label: t.tabs.profile, path: "/profile" },
  ];

  return (
    <nav className="relative z-20 flex items-center glass-card-strong border-t border-border/50 safe-bottom">
      {tabs.map(({ icon: Icon, label, path, badge }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
          >
            <div className="relative">
              <Icon className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-muted-foreground"}`} />
              {badge ? (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-foreground">
                  {badge}
                </span>
              ) : null}
            </div>
            <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
