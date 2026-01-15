const THEME_KEY = "travelgo-theme";
const LANG_KEY = "travelgo-lang";

const SUPPORTED_LANGS = ["uk", "en", "ru"];
const LANG_LABELS = {
  en: "EN",
  uk: "UK",
  ru: "RU"
};

const THEME_COPY = {
  en: {
    light: "Light",
    dark: "Dark",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme"
  },
  uk: {
    light: "Світла",
    dark: "Темна",
    toLight: "Перемкнути на світлу тему",
    toDark: "Перемкнути на темну тему"
  },
  ru: {
    light: "Светлая",
    dark: "Тёмная",
    toLight: "Переключить на светлую тему",
    toDark: "Переключить на тёмную тему"
  }
};

const getStoredValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    return null;
  }

  return value;
};

const updateThemeButtons = (theme) => {
  const isDark = theme === "dark";
  const lang = document.documentElement.getAttribute("lang") || "uk";
  const labels = THEME_COPY[lang] || THEME_COPY.uk;
  const label = isDark ? labels.dark : labels.light;
  const icon = isDark ? "☾" : "☀";
  const ariaLabel = isDark ? labels.toLight : labels.toDark;

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", ariaLabel);

    const labelNode = button.querySelector("[data-theme-label]");
    if (labelNode) {
      labelNode.textContent = label;
    }

    const iconNode = button.querySelector("[data-theme-icon]");
    if (iconNode) {
      iconNode.textContent = icon;
    }
  });
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }

  updateThemeButtons(theme);
};

const updateLangControls = (lang) => {
  const icon = LANG_LABELS[lang] || "UK";

  document.querySelectorAll("[data-lang-icon]").forEach((node) => {
    node.textContent = icon;
  });

  document.querySelectorAll("[data-lang-option]").forEach((option) => {
    const isActive = option.getAttribute("data-lang-option") === lang;
    option.classList.toggle("is-active", isActive);
  });
};

const applyLang = (lang) => {
  const root = document.documentElement;
  root.setAttribute("lang", lang);
  updateLangControls(lang);
  const currentTheme =
    root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  updateThemeButtons(currentTheme);
  document.dispatchEvent(new CustomEvent("lang:change", { detail: { lang } }));
};

const getPreferredTheme = () => {
  const stored = getStoredValue(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const getPreferredLang = () => {
  const stored = getStoredValue(LANG_KEY);
  if (SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  const current = document.documentElement.getAttribute("lang");
  if (SUPPORTED_LANGS.includes(current)) {
    return current;
  }

  return "uk";
};

const initThemeToggle = () => {
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  if (!buttons.length) {
    return;
  }

  applyTheme(getPreferredTheme());

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      setStoredValue(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  });
};

const initLangToggle = () => {
  const containers = document.querySelectorAll("[data-lang]");
  if (!containers.length) {
    return;
  }

  applyLang(getPreferredLang());

  const closeAll = () => {
    containers.forEach((container) => {
      const menu = container.querySelector("[data-lang-menu]");
      const toggle = container.querySelector("[data-lang-toggle]");
      if (menu) {
        menu.setAttribute("data-open", "false");
        menu.setAttribute("aria-hidden", "true");
      }
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };

  const toggleMenu = (container) => {
    const menu = container.querySelector("[data-lang-menu]");
    const toggle = container.querySelector("[data-lang-toggle]");
    if (!menu || !toggle) {
      return;
    }
    const isOpen = menu.getAttribute("data-open") === "true";
    closeAll();
    if (!isOpen) {
      menu.setAttribute("data-open", "true");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    }
  };

  containers.forEach((container) => {
    const toggle = container.querySelector("[data-lang-toggle]");
    const menu = container.querySelector("[data-lang-menu]");
    const options = container.querySelectorAll("[data-lang-option]");

    if (toggle) {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        toggleMenu(container);
      });
    }

    if (menu) {
      menu.setAttribute("data-open", "false");
      menu.setAttribute("aria-hidden", "true");
    }

    options.forEach((option) => {
      option.addEventListener("click", () => {
        const next = option.getAttribute("data-lang-option");
        if (!SUPPORTED_LANGS.includes(next)) {
          return;
        }
        setStoredValue(LANG_KEY, next);
        applyLang(next);
        closeAll();
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-lang]")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
};

const initPreferences = () => {
  initThemeToggle();
  initLangToggle();
};

export default initPreferences;
