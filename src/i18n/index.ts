import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "./locales/pt";
import en from "./locales/en";

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

const savedLanguage =
  typeof window !== "undefined" ? localStorage.getItem("language") : null;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "pt",
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
