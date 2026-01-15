const COPY_URL = "./data/ui-copy.json";
const DEFAULT_LANG = "uk";

const LOCALE_MAP = {
  en: "en-GB",
  uk: "uk-UA",
  ru: "ru-RU"
};

let copyPromise;

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
};

export const getUiCopy = () => {
  if (!copyPromise) {
    copyPromise = fetchJson(COPY_URL);
  }
  return copyPromise;
};

export const getCurrentLang = () =>
  document.documentElement.getAttribute("lang") || DEFAULT_LANG;

export const getLocale = (lang) => LOCALE_MAP[lang] || LOCALE_MAP[DEFAULT_LANG];

export const getLocalizedValue = (value, lang) => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    return value[lang] || value[DEFAULT_LANG] || value.en || "";
  }
  return "";
};

export const interpolate = (template, params) => {
  if (!template || typeof template !== "string") {
    return "";
  }
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params && key in params ? params[key] : ""
  );
};
