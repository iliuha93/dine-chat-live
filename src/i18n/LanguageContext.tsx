import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import ru from "./ru.json";
import ro from "./ro.json";
import en from "./en.json";

type Lang = "RU" | "RO" | "EN";

const messages: Record<Lang, typeof ru> = { RU: ru, RO: ro, EN: en };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof ru;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "RU",
  setLang: () => {},
  t: ru,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang") as Lang;
    return saved && messages[saved] ? saved : "RU";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: messages[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};
