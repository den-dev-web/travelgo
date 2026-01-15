import { initCustomSelects } from "./search-form.js";
import { getCurrentLang, getLocalizedValue, getUiCopy, interpolate } from "./i18n.js";

let cachedCopy;
let currentLang = getCurrentLang();
let activeTour;

const getBadgeLabel = (lang, key) =>
  cachedCopy?.labels?.badges?.[key]?.[lang] || key;
const getDifficultyLabel = (lang, key) =>
  cachedCopy?.labels?.difficulty?.[key]?.[lang] || "";

export default async function initTourPage() {
  const container = document.querySelector("[data-tour-title]");
  if (!container) {
    return;
  }

  getUiCopy()
    .then((copy) => {
      cachedCopy = copy;
      applyTourCopy();
      if (activeTour) {
        hydrateHero(activeTour);
        hydrateProgram(activeTour);
        hydrateIncludes(activeTour);
        hydrateGallery(activeTour);
      }
    })
    .catch(() => {});

  document.addEventListener("lang:change", (event) => {
    currentLang = event.detail?.lang || getCurrentLang();
    applyTourCopy();
    if (activeTour) {
      hydrateHero(activeTour);
      hydrateProgram(activeTour);
      hydrateIncludes(activeTour);
      hydrateGallery(activeTour);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const emptyState = document.querySelector("[data-tour-empty]");
  const sections = document.querySelectorAll("main > section");

  try {
    const response = await fetch("./data/tours.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load tours");
    }
    const data = await response.json();
    const tours = Array.isArray(data.tours) ? data.tours : [];
    const tour = tours.find((item) => item.id === id);

    if (!tour) {
      showEmptyState(sections, emptyState);
      return;
    }

    activeTour = tour;
    applyTourCopy();
    hydrateHero(tour);
    hydrateProgram(tour);
    hydrateIncludes(tour);
    hydrateGallery(tour);
    initBookingForm();
  } catch (error) {
    showEmptyState(sections, emptyState);
  }
}

function showEmptyState(sections, emptyState) {
  sections.forEach((section) => {
    if (section !== emptyState) {
      section.hidden = true;
    }
  });
  if (emptyState) {
    emptyState.hidden = false;
  }
}

function applyTourCopy() {
  if (!cachedCopy) {
    return;
  }
  const lang = currentLang;
  const tourCopy = cachedCopy?.ui?.tour?.[lang];
  const bookingCopy = cachedCopy?.ui?.booking?.[lang];
  if (!tourCopy) {
    return;
  }

  const heroLabels = document.querySelectorAll(".c-tour-hero__label");
  if (heroLabels[0] && tourCopy.metaPrice) {
    heroLabels[0].textContent = tourCopy.metaPrice;
  }
  if (heroLabels[1] && tourCopy.metaDays) {
    heroLabels[1].textContent = tourCopy.metaDays;
  }
  if (heroLabels[2] && tourCopy.metaDifficulty) {
    heroLabels[2].textContent = tourCopy.metaDifficulty;
  }

  const prevButton = document.querySelector("[data-tour-prev]");
  if (prevButton && tourCopy.prev) {
    prevButton.textContent = tourCopy.prev;
  }
  const nextButton = document.querySelector("[data-tour-next]");
  if (nextButton && tourCopy.next) {
    nextButton.textContent = tourCopy.next;
  }

  const heroCta = document.querySelector(".c-tour-hero__cta a");
  if (heroCta && tourCopy.bookingCta) {
    heroCta.textContent = tourCopy.bookingCta;
  }

  const program = document.querySelector("#program");
  if (program) {
    const eyebrow = program.querySelector(".c-section__eyebrow");
    const title = program.querySelector(".c-section__title");
    if (eyebrow && tourCopy.programEyebrow) {
      eyebrow.textContent = tourCopy.programEyebrow;
    }
    if (title && tourCopy.programTitle) {
      title.textContent = tourCopy.programTitle;
    }
  }

  const includes = document.querySelector("#includes");
  if (includes) {
    const headers = includes.querySelectorAll(".c-section__header");
    if (headers[0]) {
      const eyebrow = headers[0].querySelector(".c-section__eyebrow");
      const title = headers[0].querySelector(".c-section__title");
      if (eyebrow && tourCopy.includesEyebrow) {
        eyebrow.textContent = tourCopy.includesEyebrow;
      }
      if (title && tourCopy.includesTitle) {
        title.textContent = tourCopy.includesTitle;
      }
    }
    if (headers[1]) {
      const eyebrow = headers[1].querySelector(".c-section__eyebrow");
      const title = headers[1].querySelector(".c-section__title");
      if (eyebrow && tourCopy.excludedLabel) {
        eyebrow.textContent = tourCopy.excludedLabel;
      }
      if (title && tourCopy.excludedTitle) {
        title.textContent = tourCopy.excludedTitle;
      }
    }
  }

  const gallery = document.querySelector("#tour-gallery");
  if (gallery) {
    const eyebrow = gallery.querySelector(".c-section__eyebrow");
    const title = gallery.querySelector(".c-section__title");
    if (eyebrow && tourCopy.galleryEyebrow) {
      eyebrow.textContent = tourCopy.galleryEyebrow;
    }
    if (title && tourCopy.galleryTitle) {
      title.textContent = tourCopy.galleryTitle;
    }
  }

  const booking = document.querySelector("#booking");
  if (booking) {
    const eyebrow = booking.querySelector(".c-section__eyebrow");
    const title = booking.querySelector(".c-section__title");
    const intro = booking.querySelector("p");
    if (eyebrow && tourCopy.bookingEyebrow) {
      eyebrow.textContent = tourCopy.bookingEyebrow;
    }
    if (title && tourCopy.bookingTitle) {
      title.textContent = tourCopy.bookingTitle;
    }
    if (intro && tourCopy.bookingIntro) {
      intro.textContent = tourCopy.bookingIntro;
    }
  }

  const emptyState = document.querySelector("[data-tour-empty]");
  if (emptyState) {
    const eyebrow = emptyState.querySelector(".c-section__eyebrow");
    const title = emptyState.querySelector(".c-section__title");
    const text = emptyState.querySelector("p");
    const cta = emptyState.querySelector(".c-button");
    if (eyebrow && tourCopy.emptyEyebrow) {
      eyebrow.textContent = tourCopy.emptyEyebrow;
    }
    if (title && tourCopy.emptyTitle) {
      title.textContent = tourCopy.emptyTitle;
    }
    if (text && tourCopy.emptyText) {
      text.textContent = tourCopy.emptyText;
    }
    if (cta && tourCopy.emptyCta) {
      cta.textContent = tourCopy.emptyCta;
    }
  }

  const form = document.querySelector("[data-booking-form]");
  if (form && bookingCopy) {
    setFormLabel(form, "name", bookingCopy.name);
    setFormLabel(form, "phone", bookingCopy.phone);
    setFormLabel(form, "email", bookingCopy.email);
    setFormLabel(form, "start", bookingCopy.startDate || bookingCopy.dates);
    setFormLabel(form, "end", bookingCopy.endDate || bookingCopy.dates);
    setFormLabel(form, "people", bookingCopy.travelers);
    const submit = form.querySelector("button[type='submit']");
    if (submit && bookingCopy.submit) {
      submit.textContent = bookingCopy.submit;
    }
  }
}

function setFormLabel(form, name, text) {
  if (!text) {
    return;
  }
  const input = form.querySelector(`[name='${name}']`);
  const field = input?.closest(".c-field");
  const label = field?.querySelector(".c-field__label");
  if (label) {
    label.textContent = text;
  }
}

function hydrateHero(tour) {
  const lang = currentLang;
  const tourCardCopy = cachedCopy?.ui?.tourCard?.[lang] || {};
  const title = document.querySelector("[data-tour-title]");
  const country = document.querySelector("[data-tour-country]");
  const description = document.querySelector("[data-tour-description]");
  const price = document.querySelector("[data-tour-price]");
  const days = document.querySelector("[data-tour-days]");
  const difficulty = document.querySelector("[data-tour-difficulty]");
  const badges = document.querySelector("[data-tour-badges]");
  const heroMedia = document.querySelector("[data-tour-hero-media]");
  const thumbs = document.querySelector("[data-tour-hero-thumbs]");
  const prevButton = document.querySelector("[data-tour-prev]");
  const nextButton = document.querySelector("[data-tour-next]");

  if (title) {
    title.textContent = getLocalizedValue(tour.title, lang);
  }
  if (country) {
    const countryLabel = getLocalizedValue(tour.location?.country, lang);
    const regionLabel = getLocalizedValue(tour.location?.region, lang);
    const parts = [countryLabel, regionLabel].filter(Boolean);
    country.textContent = parts.join(" · ");
  }
  if (description) {
    description.textContent = getLocalizedValue(tour.shortDescription, lang);
  }
  if (price) {
    price.textContent = `€${tour.priceEUR}`;
  }
  if (days) {
    const daysLabel = tourCardCopy.days || "дней";
    days.textContent = `${tour.days} ${daysLabel}`;
  }
  if (difficulty) {
    difficulty.textContent = getDifficultyLabel(lang, tour.difficulty);
  }

  if (badges) {
    badges.innerHTML = "";
    if (Array.isArray(tour.badges)) {
      tour.badges.forEach((badgeKey) => {
        const badge = document.createElement("span");
        badge.className = "c-badge";
        badge.textContent = getBadgeLabel(lang, badgeKey) || "Spec";
        badges.appendChild(badge);
      });
    }
  }

  if (heroMedia && Array.isArray(tour.images)) {
    setHeroImage(
      heroMedia,
      tour.images[0],
      getLocalizedValue(tour.title, lang),
      "eager"
    );
  }

  if (thumbs && Array.isArray(tour.images)) {
    thumbs.innerHTML = "";
    tour.images.forEach((src, index) => {
      const button = document.createElement("button");
      button.className = "c-tour-hero__thumb";
      button.type = "button";
      button.dataset.index = index.toString();
      button.dataset.active = index === 0 ? "true" : "false";
      button.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async">`;
      button.addEventListener("click", () => {
        updateHeroIndex(index, tour, heroMedia, thumbs);
      });
      thumbs.appendChild(button);
    });
  }

  if (prevButton && Array.isArray(tour.images) && !prevButton.dataset.bound) {
    prevButton.addEventListener("click", () => {
      shiftHeroIndex(-1, tour, heroMedia, thumbs);
    });
    prevButton.dataset.bound = "true";
  }

  if (nextButton && Array.isArray(tour.images) && !nextButton.dataset.bound) {
    nextButton.addEventListener("click", () => {
      shiftHeroIndex(1, tour, heroMedia, thumbs);
    });
    nextButton.dataset.bound = "true";
  }
}

function hydrateProgram(tour) {
  const lang = currentLang;
  const dayTemplate =
    cachedCopy?.ui?.tour?.[lang]?.dayLabel || "День {day}";
  const program = document.querySelector("[data-tour-program]");
  if (!program || !Array.isArray(tour.program)) {
    return;
  }
  program.innerHTML = "";
  tour.program.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "c-accordion__item";
    wrapper.dataset.accordionItem = "";
    if (index === 0) {
      wrapper.dataset.open = "true";
    }

    const trigger = document.createElement("button");
    trigger.className = "c-accordion__trigger";
    trigger.type = "button";
    trigger.dataset.accordionTrigger = "";
    trigger.setAttribute("aria-expanded", index === 0 ? "true" : "false");
    trigger.setAttribute("aria-controls", `program-panel-${index}`);
    trigger.textContent = interpolate(dayTemplate, { day: item.day });

    const panel = document.createElement("div");
    panel.className = "c-accordion__panel";
    panel.dataset.accordionPanel = "";
    panel.id = `program-panel-${index}`;
    panel.setAttribute("aria-hidden", index === 0 ? "false" : "true");

    const inner = document.createElement("div");
    inner.className = "c-accordion__panel-inner";
    inner.textContent = getLocalizedValue(item.text, lang);

    panel.appendChild(inner);
    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    program.appendChild(wrapper);

    panel.style.maxHeight = index === 0 ? `${panel.scrollHeight}px` : "0px";
  });
}

function hydrateIncludes(tour) {
  const lang = currentLang;
  const included = document.querySelector("[data-tour-included]");
  const excluded = document.querySelector("[data-tour-excluded]");

  if (included) {
    included.innerHTML = "";
    const list = getLocalizedList(tour.included, lang);
    list.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      included.appendChild(li);
    });
  }

  if (excluded) {
    excluded.innerHTML = "";
    const list = getLocalizedList(tour.excluded, lang);
    list.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      excluded.appendChild(li);
    });
  }
}

function hydrateGallery(tour) {
  const gallery = document.querySelector("[data-tour-gallery]");
  if (!gallery || !Array.isArray(tour.images)) {
    return;
  }
  gallery.innerHTML = "";
  tour.images.forEach((src) => {
    const figure = document.createElement("figure");
    figure.innerHTML = createPicture(
      src,
      getLocalizedValue(tour.title, currentLang),
      "lazy"
    );
    gallery.appendChild(figure);
  });
}

function initBookingForm() {
  const form = document.querySelector("[data-booking-form]");
  const status = document.querySelector("[data-booking-status]");

  if (!form) {
    return;
  }

  initCustomSelects(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const errors = new Map();
    const lang = currentLang;
    const messages = cachedCopy?.ui?.messages?.[lang] || {};
    const bookingCopy = cachedCopy?.ui?.booking?.[lang] || {};

    ["name", "phone", "email", "start", "end"].forEach((field) => {
      if (!data.get(field)) {
        errors.set(field, messages.required || "Поле обязательно.");
      }
    });

    const start = data.get("start");
    const end = data.get("end");
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate < startDate) {
        errors.set("end", messages.dateOrder || "Дата окончания раньше даты начала.");
      }
    }

    applyFieldErrors(form, errors);

    if (errors.size > 0) {
      if (status) {
        status.textContent =
          messages.formInvalid || "Заполните форму корректно.";
      }
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.setAttribute("data-loading", "true");
      submitButton.disabled = true;
    }

    if (status) {
      status.textContent = bookingCopy.loading || "Отправляем заявку...";
    }

    try {
      const response = await fetch("./data/ui-copy.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      if (status) {
        status.textContent =
          bookingCopy.success || "Заявка отправлена. Мы свяжемся с вами.";
      }
      form.reset();
    } catch (error) {
      if (status) {
        status.textContent =
          bookingCopy.error || "Не удалось отправить. Попробуйте позже.";
      }
    } finally {
      if (submitButton) {
        submitButton.removeAttribute("data-loading");
        submitButton.disabled = false;
      }
    }
  });
}

function applyFieldErrors(form, errors) {
  const fields = form.querySelectorAll("[data-field]");

  fields.forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    const error = field.querySelector(".c-field__error");

    if (!input) {
      return;
    }

    const message = errors.get(input.name) || "";
    field.setAttribute("data-invalid", message ? "true" : "false");

    if (error) {
      error.textContent = message;
    }
  });
}

function getLocalizedList(list, lang) {
  if (!list || typeof list !== "object") {
    return [];
  }
  return list[lang] || list.uk || list.en || list.ru || [];
}

function createPicture(src, altText, loading = "lazy") {
  if (!src) {
    return "";
  }
  const safeAlt = altText ? altText.replace(/"/g, "&quot;") : "";
  const sources = buildSources(src);
  return `<picture>
    ${sources}
    <img src="${src}" alt="${safeAlt}" loading="${loading}" decoding="async">
  </picture>`;
}

function setHeroImage(heroMedia, src, altText, loading) {
  heroMedia.innerHTML = createPicture(src, altText, loading);
}

function updateHeroIndex(index, tour, heroMedia, thumbs) {
  if (!tour.images || !tour.images[index]) {
    return;
  }
  if (heroMedia) {
    setHeroImage(
      heroMedia,
      tour.images[index],
      getLocalizedValue(tour.title, currentLang),
      "eager"
    );
  }
  if (thumbs) {
    Array.from(thumbs.children).forEach((child) => {
      child.dataset.active = child.dataset.index === index.toString() ? "true" : "false";
    });
  }
}

function shiftHeroIndex(step, tour, heroMedia, thumbs) {
  if (!thumbs || !tour.images) {
    return;
  }
  const active = Array.from(thumbs.children).find((child) => child.dataset.active === "true");
  const currentIndex = active ? Number(active.dataset.index) : 0;
  const nextIndex = (currentIndex + step + tour.images.length) % tour.images.length;
  updateHeroIndex(nextIndex, tour, heroMedia, thumbs);
}

function buildSources(src) {
  if (src.toLowerCase().endsWith(".jpg")) {
    const avif = src.replace(/\.jpg$/i, ".avif");
    const webp = src.replace(/\.jpg$/i, ".webp");
    return `<source srcset="${avif}" type="image/avif">
    <source srcset="${webp}" type="image/webp">`;
  }
  return "";
}
