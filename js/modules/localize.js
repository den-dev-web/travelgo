import { getCurrentLang, getLocalizedValue, getUiCopy, interpolate } from "./i18n.js";

let cachedCopy;
let cachedTours;
let cachedFaq;
let cachedReviews;

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
};

const getTours = async () => {
  if (cachedTours) {
    return cachedTours;
  }
  const data = await fetchJson("./data/tours.json");
  cachedTours = Array.isArray(data.tours) ? data.tours : [];
  return cachedTours;
};

const getFaq = async () => {
  if (cachedFaq) {
    return cachedFaq;
  }
  const data = await fetchJson("./data/faq.json");
  cachedFaq = Array.isArray(data.faq) ? data.faq : [];
  return cachedFaq;
};

const getReviews = async () => {
  if (cachedReviews) {
    return cachedReviews;
  }
  const data = await fetchJson("./data/reviews.json");
  cachedReviews = Array.isArray(data.reviews) ? data.reviews : [];
  return cachedReviews;
};

const updateNavLinks = (copy, lang) => {
  const navCopy = copy.ui?.nav?.[lang];
  if (!navCopy) {
    return;
  }

  const setLink = (selector, text) => {
    if (!text) {
      return;
    }
    document.querySelectorAll(selector).forEach((link) => {
      link.textContent = text;
    });
  };

  setLink("a[href$='#destinations']", navCopy.destinations);
  setLink("a[href$='#catalog']", navCopy.tours);
  setLink("a[href$='#gallery']", navCopy.gallery);
  setLink("a[href$='#reviews']", navCopy.reviews);
  setLink("a[href$='#faq']", navCopy.faq);
  setLink("a[href$='#search']", navCopy.cta);
};

const updateHero = (copy, lang) => {
  const heroCopy = copy.ui?.hero?.[lang];
  if (!heroCopy) {
    return;
  }

  const eyebrow = document.querySelector(".c-hero .c-section__eyebrow");
  const title = document.querySelector(".c-hero__title");
  const subtitle = document.querySelector(".c-hero__text");
  const actions = document.querySelectorAll(".c-hero__actions .c-button");

  if (eyebrow && heroCopy.eyebrow) {
    eyebrow.textContent = heroCopy.eyebrow;
  }
  if (title && heroCopy.title) {
    title.textContent = heroCopy.title;
  }
  if (subtitle && heroCopy.subtitle) {
    subtitle.textContent = heroCopy.subtitle;
  }
  if (actions[0] && heroCopy.ctaPrimary) {
    actions[0].textContent = heroCopy.ctaPrimary;
  }
  if (actions[1] && heroCopy.ctaSecondary) {
    actions[1].textContent = heroCopy.ctaSecondary;
  }

  const highlights = document.querySelectorAll(".c-hero__highlight");
  if (Array.isArray(heroCopy.highlights)) {
    highlights.forEach((item, index) => {
      const data = heroCopy.highlights[index];
      if (!data) {
        return;
      }
      const value = item.querySelector(".c-hero__highlight-value");
      const label = item.querySelector(".c-hero__highlight-label");
      if (value && data.value) {
        value.textContent = data.value;
      }
      if (label && data.label) {
        label.textContent = data.label;
      }
    });
  }
};

const updateDestinations = async (copy, lang) => {
  const sectionCopy = copy.ui?.destinations?.[lang];
  if (sectionCopy) {
    const eyebrow = document.querySelector("#destinations .c-section__eyebrow");
    const title = document.querySelector("#destinations .c-section__title");
    if (eyebrow && sectionCopy.eyebrow) {
      eyebrow.textContent = sectionCopy.eyebrow;
    }
    if (title && sectionCopy.title) {
      title.textContent = sectionCopy.title;
    }
  }

  const cards = document.querySelectorAll("[data-featured-tour]");
  if (!cards.length) {
    return;
  }

  const tours = await getTours();
  const tourCardCopy = copy.ui?.tourCard?.[lang] || {};
  cards.forEach((card) => {
    const id = card.dataset.featuredTour;
    const tour = tours.find((item) => item.id === id);
    if (!tour) {
      return;
    }

    const badge = card.querySelector(".c-card__meta .c-badge:not(.c-card__country)");
    if (badge && Array.isArray(tour.badges) && tour.badges.length > 0) {
      const key = tour.badges[0];
      badge.textContent = copy.labels?.badges?.[key]?.[lang] || badge.textContent;
    }

    const country = card.querySelector(".c-card__country");
    if (country) {
      country.textContent = getLocalizedValue(tour.location?.country, lang);
    }

    const title = card.querySelector(".c-card__title");
    if (title) {
      title.textContent = getLocalizedValue(tour.title, lang);
    }

    const description = card.querySelector(".c-card__body p");
    if (description) {
      description.textContent = getLocalizedValue(tour.shortDescription, lang);
    }

    const link = card.querySelector(".c-card__actions .c-button");
    if (link && tourCardCopy.details) {
      link.textContent = tourCardCopy.details;
    }
  });
};

const updateCardsSection = (sectionId, sectionCopy) => {
  const section = document.querySelector(sectionId);
  if (!section || !sectionCopy) {
    return;
  }
  const eyebrow = section.querySelector(".c-section__eyebrow");
  const title = section.querySelector(".c-section__title");
  if (eyebrow && sectionCopy.eyebrow) {
    eyebrow.textContent = sectionCopy.eyebrow;
  }
  if (title && sectionCopy.title) {
    title.textContent = sectionCopy.title;
  }
  const cards = section.querySelectorAll(".c-card");
  if (Array.isArray(sectionCopy.cards)) {
    cards.forEach((card, index) => {
      const data = sectionCopy.cards[index];
      if (!data) {
        return;
      }
      const cardTitle = card.querySelector(".c-card__title");
      const cardText = card.querySelector("p");
      if (cardTitle && data.title) {
        cardTitle.textContent = data.title;
      }
      if (cardText && data.text) {
        cardText.textContent = data.text;
      }
    });
  }
};

const updateGallery = (copy, lang) => {
  const galleryCopy = copy.ui?.gallery?.[lang];
  if (!galleryCopy) {
    return;
  }
  const eyebrow = document.querySelector("#gallery .c-section__eyebrow");
  const title = document.querySelector("#gallery .c-section__title");
  if (eyebrow && galleryCopy.eyebrow) {
    eyebrow.textContent = galleryCopy.eyebrow;
  }
  if (title && galleryCopy.title) {
    title.textContent = galleryCopy.title;
  }
};

const updateReviews = async (copy, lang) => {
  const sectionCopy = copy.ui?.reviews?.[lang];
  const eyebrow = document.querySelector("#reviews .c-section__eyebrow");
  const title = document.querySelector("#reviews .c-section__title");
  if (eyebrow && sectionCopy?.eyebrow) {
    eyebrow.textContent = sectionCopy.eyebrow;
  }
  if (title && sectionCopy?.title) {
    title.textContent = sectionCopy.title;
  }

  const prev = document.querySelector("[data-reviews-prev]");
  const next = document.querySelector("[data-reviews-next]");
  if (prev && sectionCopy?.prev) {
    prev.setAttribute("aria-label", sectionCopy.prev);
  }
  if (next && sectionCopy?.next) {
    next.setAttribute("aria-label", sectionCopy.next);
  }

  const track = document.querySelector("[data-reviews-track]");
  if (!track) {
    return;
  }

  const reviews = await getReviews();
  const cards = track.querySelectorAll(".c-reviews__card");
  const items = Array.from(cards);
  items.forEach((card, index) => {
    const review = reviews[index];
    if (!review) {
      return;
    }
    const name = card.querySelector(".c-reviews__name");
    const meta = card.querySelector(".c-reviews__meta");
    const text = card.querySelector("p");
    const rating = card.querySelector(".c-rating");
    const ratingValue = card.querySelector(".c-rating__value");
    const avatar = card.querySelector("img");

    if (name) {
      name.textContent = review.name;
    }
    if (meta) {
      meta.textContent = `${getLocalizedValue(review.country, lang)} · ${getLocalizedValue(
        review.date,
        lang
      )}`;
    }
    if (text) {
      text.textContent = `"${getLocalizedValue(review.text, lang)}"`;
    }
    if (rating && sectionCopy?.ratingLabel) {
      rating.setAttribute(
        "aria-label",
        interpolate(sectionCopy.ratingLabel, { value: review.rating })
      );
      rating.style.setProperty("--rating", review.rating);
    }
    if (ratingValue) {
      ratingValue.textContent = review.rating.toFixed(1);
    }
    if (avatar) {
      avatar.src = `../${review.avatar}`;
      avatar.alt = review.name;
    }
  });
};

const updateFaq = async (copy, lang) => {
  const sectionCopy = copy.ui?.faq?.[lang];
  const eyebrow = document.querySelector("#faq .c-section__eyebrow");
  const title = document.querySelector("#faq .c-section__title");
  if (eyebrow && sectionCopy?.eyebrow) {
    eyebrow.textContent = sectionCopy.eyebrow;
  }
  if (title && sectionCopy?.title) {
    title.textContent = sectionCopy.title;
  }

  const accordion = document.querySelector("#faq .c-accordion");
  if (!accordion) {
    return;
  }
  const items = accordion.querySelectorAll(".c-accordion__item");
  const faq = await getFaq();
  items.forEach((item, index) => {
    const entry = faq[index];
    if (!entry) {
      return;
    }
    const trigger = item.querySelector(".c-accordion__trigger");
    const panel = item.querySelector(".c-accordion__panel-inner");
    if (trigger) {
      trigger.textContent = getLocalizedValue(entry.question, lang);
    }
    if (panel) {
      panel.textContent = getLocalizedValue(entry.answer, lang);
    }
  });
};

const updateSubscribe = (copy, lang) => {
  const sectionCopy = copy.ui?.subscribe?.[lang];
  const newsletterCopy = copy.ui?.newsletter?.[lang];
  const section = document.querySelector("#subscribe");
  if (sectionCopy && section) {
    const eyebrow = section.querySelector(".c-section__eyebrow");
    const title = section.querySelector(".c-section__title");
    if (eyebrow && sectionCopy.eyebrow) {
      eyebrow.textContent = sectionCopy.eyebrow;
    }
    if (title && sectionCopy.title) {
      title.textContent = sectionCopy.title;
    }
  }

  const form = document.querySelector("[data-subscribe-form]");
  if (form && newsletterCopy) {
    const label = form.querySelector(".c-field__label");
    if (label && newsletterCopy.email) {
      label.textContent = newsletterCopy.email;
    }
    const submit = form.querySelector("button[type='submit']");
    if (submit && newsletterCopy.submit) {
      submit.textContent = newsletterCopy.submit;
    }
  }
};

const updateFooter = (copy, lang) => {
  const footerCopy = copy.ui?.footer?.[lang];
  if (!footerCopy) {
    return;
  }
  const footer = document.querySelector(".c-footer");
  if (!footer) {
    return;
  }

  const tagline = footer.querySelector(".c-footer__brand + p");
  if (tagline && footerCopy.tagline) {
    tagline.textContent = footerCopy.tagline;
  }

  const titles = footer.querySelectorAll(".c-footer__title");
  if (titles[0] && footerCopy.companyTitle) {
    titles[0].textContent = footerCopy.companyTitle;
  }
  if (titles[1] && footerCopy.supportTitle) {
    titles[1].textContent = footerCopy.supportTitle;
  }
  if (titles[2] && footerCopy.contactTitle) {
    titles[2].textContent = footerCopy.contactTitle;
  }

  const companyLinks = footer.querySelectorAll(".c-footer__list")[0]?.querySelectorAll("a");
  footerCopy.companyLinks?.forEach((text, index) => {
    if (companyLinks?.[index]) {
      companyLinks[index].textContent = text;
    }
  });

  const supportLinks = footer.querySelectorAll(".c-footer__list")[1]?.querySelectorAll("a");
  footerCopy.supportLinks?.forEach((text, index) => {
    if (supportLinks?.[index]) {
      supportLinks[index].textContent = text;
    }
  });

  const rights = footer.querySelector(".c-footer__bottom span");
  if (rights && footerCopy.rights) {
    rights.textContent = footerCopy.rights;
  }

  const backToTop = footer.querySelector("[data-back-to-top]");
  if (backToTop && footerCopy.backToTop) {
    backToTop.textContent = footerCopy.backToTop;
  }
};

const applyLocalization = async (lang) => {
  const copy = cachedCopy || (await getUiCopy());
  cachedCopy = copy;

  updateNavLinks(copy, lang);
  updateHero(copy, lang);
  updateCardsSection("#advantages", copy.ui?.advantages?.[lang]);
  updateCardsSection("#why", copy.ui?.why?.[lang]);
  updateGallery(copy, lang);
  updateSubscribe(copy, lang);
  updateFooter(copy, lang);
  await updateDestinations(copy, lang);
  await updateReviews(copy, lang);
  await updateFaq(copy, lang);
};

export default function initLocalization() {
  applyLocalization(getCurrentLang()).catch(() => {});

  document.addEventListener("lang:change", (event) => {
    const lang = event.detail?.lang || getCurrentLang();
    applyLocalization(lang).catch(() => {});
  });
}
