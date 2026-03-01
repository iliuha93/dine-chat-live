import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Clock, Minus, Plus, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { dishes, Dish } from "@/data/menuData";
import { useCart } from "@/store/CartContext";
import { toast } from "sonner";

const getDishName = (d: Dish, lang: string) => lang === "RO" ? d.nameRo : lang === "EN" ? d.nameEn : d.name;
const getDishDesc = (d: Dish, lang: string) => lang === "RO" ? d.descriptionRo : lang === "EN" ? d.descriptionEn : d.description;

const DishDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);

  const dish = dishes.find((d) => d.id === id);
  if (!dish) return <div className="flex items-center justify-center h-screen bg-background text-foreground">Not found</div>;

  const name = getDishName(dish, lang);
  const desc = getDishDesc(dish, lang);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: dish.id, name, price: dish.price, image: dish.image });
    }
    toast.success(`${name} x${qty} добавлено`);
    navigate(-1);
  };

  return (
    <div className="relative flex flex-col h-screen bg-background max-w-md mx-auto overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img src={dish.image} alt={name} className="w-full h-[250px] object-cover" style={{ borderRadius: "0 0 24px 24px" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" style={{ borderRadius: "0 0 24px 24px" }} />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-full glass-card flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button onClick={() => setFav(!fav)} className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card flex items-center justify-center">
          <Heart className={`w-5 h-5 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary">{dish.price} {t.common.currency}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> ~{dish.prepTime} {t.dish.prep_time}
          </span>
          <span className="text-xs text-muted-foreground">{dish.weight}</span>
        </div>

        {/* Description section */}
        <div>
          <SectionTitle text={t.dish.description} />
          <p className="text-sm text-foreground leading-relaxed">{desc}</p>
        </div>

        {/* Ingredients */}
        <div>
          <SectionTitle text={t.dish.ingredients} />
          <p className="text-sm text-foreground">{dish.ingredients.join(" • ")}</p>
        </div>

        {/* Allergens */}
        {dish.allergens && dish.allergens.length > 0 && (
          <div>
            <SectionTitle text={t.dish.allergens} />
            <div className="flex flex-wrap gap-2">
              {dish.allergens.map((a) => (
                <span key={a} className="flex items-center gap-1 text-xs text-destructive bg-destructive/20 border border-destructive/30 rounded-full px-3 py-1">
                  <AlertTriangle className="w-3 h-3" /> {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-5 pb-6 pt-3 border-t border-border/50 glass-card-strong">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-lg font-bold text-foreground w-6 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full h-12 rounded-2xl gold-gradient flex items-center justify-center text-primary-foreground font-semibold text-base transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          {t.dish.add_to_order} — {dish.price * qty} {t.common.currency}
        </button>
      </div>
    </div>
  );
};

const SectionTitle = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="flex-1 h-px bg-border/50" />
    <span className="text-[11px] text-primary font-medium uppercase tracking-wider">{text}</span>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

export default DishDetailPage;
