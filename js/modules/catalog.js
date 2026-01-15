import {
  getCurrentLang,
  getLocalizedValue,
  getLocale,
  getUiCopy,
  interpolate
} from "./i18n.js";

const BADGE_CLASS = {
  popular: "",
  "best-value": "c-badge--warn",
  "top-rated": "c-badge--secondary",
  romantic: "c-badge--secondary",
  new: "c-badge--success",
  cultural: "",
  adventure: "c-badge--secondary",
  seasonal: "c-badge--warn",
  "city-break": "",
  family: "c-badge--success",
};

let cachedCopy;
let currentLang = getCurrentLang();

const getFiltersCopy = (lang) => cachedCopy?.ui?.filters?.[lang] || {};
const getCatalogCopy = (lang) => cachedCopy?.ui?.catalog?.[lang] || {};
const getBadgeLabel = (lang, key) =>
  cachedCopy?.labels?.badges?.[key]?.[lang] || key;

export default async function initCatalog() {
  const list = document.querySelector("[data-tours-list]");
  const status = document.querySelector("[data-tours-count]");
  const filtersForm = document.querySelector("[data-filters]");
  const priceOutput = document.querySelector("[data-price-output]");
  const filtersModal = document.querySelector("[data-filters-modal]");
  const filtersOpen = document.querySelector("[data-filters-open]");
  const filtersOverlay = document.querySelector("[data-filters-overlay]");
  const filtersClose = document.querySelector("[data-filters-close]");
  const filtersApply = document.querySelector("[data-filters-apply]");
  const filtersSummary = document.querySelector("[data-filters-summary]");

  if (!list) {
    return;
  }

  getUiCopy()
    .then((copy) => {
      cachedCopy = copy;
      applyCatalogCopy(filtersForm, list);
      updatePriceLabel();
    })
    .catch(() => {});

  document.addEventListener("lang:change", (event) => {
    currentLang = event.detail?.lang || getCurrentLang();
    applyCatalogCopy(filtersForm, list);
    updateCountryOptions(filtersForm, tours, currentLang);
    updatePriceLabel();
    render();
  });

  list.innerHTML = "";
  let tours = [];
  let dataLoaded = false;
  let loadFailed = false;

  const state = {
    country: "",
    price: filtersForm ? Number(filtersForm.price?.value || 0) : 0,
    days: "",
    periodStart: "",
    periodEnd: "",
    people: "",
    rating: "",
  };

  const syncState = () => {
    if (!filtersForm) {
      return;
    }
    state.country = filtersForm.country?.value || "";
    state.days = filtersForm.days?.value || "";
    state.periodStart = filtersForm.periodStart?.value || "";
    state.periodEnd = filtersForm.periodEnd?.value || "";
    state.people = filtersForm.people?.value || "";
    state.rating = filtersForm.rating?.value || "";
    state.price = Number(filtersForm.price?.value || 0);
  };

  const render = () => {
    if (loadFailed) {
      updateSummary();
      return;
    }
    if (!dataLoaded) {
      return;
    }

    const filtered = applyFilters(tours, state);
    list.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      const filtersCopy = getFiltersCopy(currentLang);
      empty.textContent =
        filtersCopy.empty || "Ничего не найдено. Попробуйте изменить фильтры.";
      list.appendChild(empty);
    } else {
      filtered.forEach((tour) => list.appendChild(buildTourCard(tour)));
    }

    if (status) {
      const catalogCopy = getCatalogCopy(currentLang);
      const template = catalogCopy.results || "Найдено {count} туров";
      status.textContent = interpolate(template, { count: filtered.length });
    }

    updateSummary();
  };

  const updatePriceLabel = () => {
    if (priceOutput) {
      const value = state.price || Number(filtersForm?.price?.value || 0);
      const filtersCopy = getFiltersCopy(currentLang);
      const template = filtersCopy.priceTo || "До {value} EUR";
      priceOutput.textContent = interpolate(template, { value });
    }
  };

  const applySearchDetail = (detail = {}) => {
    if (!filtersForm) {
      return;
    }
    const { countryKey, daysRange, people, periodStart, periodEnd } = detail;
    if (countryKey !== undefined) {
      setFilterSelectValue(filtersForm, "country", countryKey);
    }
    if (daysRange !== undefined) {
      setFilterSelectValue(filtersForm, "days", daysRange);
    }
    if (people !== undefined) {
      setFilterSelectValue(filtersForm, "people", people);
    }
    if (periodStart !== undefined || periodEnd !== undefined) {
      setPeriodValues(periodStart, periodEnd);
    }
    syncState();
    render();
  };

  const setPeriodValues = (startValue, endValue) => {
    if (!filtersForm) {
      return;
    }
    const trigger = filtersForm.querySelector("[data-date-trigger]");
    const value = filtersForm.querySelector("[data-date-value]");
    const startInput = filtersForm.querySelector("[data-date-start]");
    const endInput = filtersForm.querySelector("[data-date-end]");

    if (!trigger || !value || !startInput || !endInput) {
      return;
    }

    startInput.value = startValue || "";
    endInput.value = endValue || "";

    if (startInput.value && endInput.value) {
      const startLabel = formatPeriodDate(startInput.value);
      const endLabel = formatPeriodDate(endInput.value);
      if (startLabel && endLabel) {
        value.textContent = `${startLabel} — ${endLabel}`;
        trigger.classList.remove("is-placeholder");
        return;
      }
    }

    const filtersCopy = getFiltersCopy(currentLang);
    value.textContent = filtersCopy.periodPlaceholder || "Выберите даты";
    trigger.classList.add("is-placeholder");
  };

    if (filtersForm) {
      initFilterSelects(filtersForm);
      syncState();
      updatePriceLabel();
      updateSummary();

    const handleChange = () => {
      syncState();
      render();
    };

    const handlePriceInput = debounce(() => {
      syncState();
      updatePriceLabel();
      render();
    }, 150);

    filtersForm.addEventListener("change", handleChange);
      filtersForm.addEventListener("input", (event) => {
        if (event.target === filtersForm.price) {
          handlePriceInput();
        }
      });

      if (filtersSummary) {
        filtersSummary.addEventListener("click", (event) => {
          const button = event.target.closest("[data-filter-clear]");
          if (!button) {
            return;
          }
          const key = button.getAttribute("data-filter-clear");
          if (!key) {
            return;
          }
          clearFilter(key);
        });
      }

      filtersForm.addEventListener("search:apply", (event) => {
        if (filtersForm.dataset.searchApply) {
          delete filtersForm.dataset.searchApply;
        }
        applySearchDetail(event.detail || {});
    });

    document.addEventListener("search:apply", (event) => {
      applySearchDetail(event.detail || {});
    });

    document.addEventListener("filters:refresh", () => {
      syncState();
      updatePriceLabel();
      render();
    });

    if (filtersForm.dataset.searchApply) {
      try {
        const detail = JSON.parse(filtersForm.dataset.searchApply);
        applySearchDetail(detail || {});
      } catch (error) {
        // ignore malformed stored payload
      }
      delete filtersForm.dataset.searchApply;
    }

    const observer = new MutationObserver((mutations) => {
      const hasSearchApply = mutations.some(
        (mutation) =>
          mutation.type === "attributes" &&
          mutation.attributeName === "data-search-apply"
      );
      if (!hasSearchApply || !filtersForm.dataset.searchApply) {
        return;
      }
      try {
        const detail = JSON.parse(filtersForm.dataset.searchApply);
        applySearchDetail(detail || {});
      } catch (error) {
        // ignore malformed stored payload
      }
      delete filtersForm.dataset.searchApply;
    });

    observer.observe(filtersForm, { attributes: true });
  }

  try {
    const response = await fetch("./data/tours.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load tours");
    }
    const data = await response.json();
    tours = Array.isArray(data.tours) ? data.tours : [];
    updateCountryOptions(filtersForm, tours, currentLang);
    dataLoaded = true;
    render();
  } catch (error) {
    loadFailed = true;
    const catalogCopy = getCatalogCopy(currentLang);
    list.textContent =
      catalogCopy.error || "Не удалось загрузить туры. Попробуйте позже.";
    updateSummary();
  }

  setupFiltersModal();

  function updateSummary() {
    if (!filtersSummary || !filtersForm) {
      return;
    }

    const filtersCopy = getFiltersCopy(currentLang);
    const summaryItems = [];
    const countryLabel = getFilterLabel(filtersForm, "country");
    const periodLabel = getPeriodLabel(filtersForm);
    const daysLabel = getFilterLabel(filtersForm, "days");
    const peopleLabel = getFilterLabel(filtersForm, "people");
    const ratingLabel = getFilterLabel(filtersForm, "rating");
    const priceValue = filtersForm.price?.value;

    if (priceValue) {
      const maxPrice = Number(filtersForm.price?.max || 0);
      if (!maxPrice || Number(priceValue) < maxPrice) {
        const template = filtersCopy.priceTo || "до {value} EUR";
        summaryItems.push({
          label: interpolate(template, { value: priceValue }),
          key: "price"
        });
      }
    }
    if (periodLabel) {
      summaryItems.push({ label: periodLabel, key: "period" });
    }
    if (daysLabel) {
      summaryItems.push({ label: daysLabel, key: "days" });
    }
    if (peopleLabel) {
      summaryItems.push({ label: peopleLabel, key: "people" });
    }
    if (ratingLabel) {
      summaryItems.push({ label: ratingLabel, key: "rating" });
    }
    if (countryLabel) {
      summaryItems.unshift({ label: countryLabel, key: "country" });
    }

    filtersSummary.innerHTML = "";

    if (summaryItems.length === 0) {
      const chip = document.createElement("span");
      chip.className = "c-filter-chip c-filter-chip--muted";
      chip.textContent = filtersCopy.summaryAll || "Все туры";
      filtersSummary.appendChild(chip);
      return;
    }

    summaryItems.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "c-filter-chip c-filter-chip--clearable";
      chip.setAttribute("data-filter-clear", item.key);
      const clearLabel =
        filtersCopy.clearFilterLabel || "Удалить фильтр: {label}";
      chip.setAttribute(
        "aria-label",
        interpolate(clearLabel, { label: item.label })
      );

      const text = document.createElement("span");
      text.textContent = item.label;
      chip.appendChild(text);

      const icon = document.createElement("span");
      icon.className = "c-filter-chip__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "×";
      chip.appendChild(icon);

      filtersSummary.appendChild(chip);
    });
  }

  function clearFilter(key) {
    if (!filtersForm) {
      return;
    }
    if (key === "price") {
      const maxPrice = filtersForm.price?.max;
      if (filtersForm.price && maxPrice) {
        filtersForm.price.value = maxPrice;
        updatePriceLabel();
      }
    } else if (key === "period") {
      setPeriodValues("", "");
    } else {
      setFilterSelectValue(filtersForm, key, "");
    }
    syncState();
    render();
  }

  function getSelectedLabel(select) {
    if (!select) {
      return "";
    }
    const option = select.selectedOptions?.[0];
    if (!option || !option.value) {
      return "";
    }
    return option.textContent;
  }

  function getFilterLabel(form, key) {
    const wrapper = form.querySelector(
      `[data-filter-select][data-filter-key='${key}']`
    );
    if (!wrapper) {
      return getSelectedLabel(form?.[key]);
    }
    if (!form?.[key]?.value) {
      return "";
    }
    return wrapper.dataset.selectedLabel || "";
  }

  function getPeriodLabel(form) {
    const startValue = form.periodStart?.value || "";
    const endValue = form.periodEnd?.value || "";

    if (!startValue || !endValue) {
      return "";
    }

    const startLabel = formatPeriodDate(startValue);
    const endLabel = formatPeriodDate(endValue);

    if (!startLabel || !endLabel) {
      return "";
    }

    return `${startLabel} — ${endLabel}`;
  }

  function formatPeriodDate(value) {
    const date = parsePeriodDate(value);
    if (!date) {
      return "";
    }
    return date.toLocaleDateString(getLocale(currentLang), {
      day: "2-digit",
      month: "short"
    });
  }

  function parsePeriodDate(value) {
    if (!value) {
      return null;
    }
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  function initFilterSelects(form) {
    const wrappers = Array.from(form.querySelectorAll("[data-filter-select]"));
    if (wrappers.length === 0) {
      return;
    }

    const modal = document.querySelector("[data-filter-select-modal]");
    const overlay = modal?.querySelector("[data-filter-select-overlay]");
    const closeButton = modal?.querySelector("[data-filter-select-close]");
    const title = modal?.querySelector("[data-filter-select-title]");
    const list = modal?.querySelector("[data-filter-select-list]");

    if (!modal || !overlay || !closeButton || !title || !list) {
      return;
    }

    let activeWrapper = null;
    let lastFocused = null;

    const applyOption = (wrapper, option) => {
      const value = wrapper.querySelector("[data-filter-value]");
      const input = wrapper.querySelector("[data-filter-input]");
      const options = Array.from(
        wrapper.querySelectorAll("[data-filter-option]")
      );

      if (!value || !input || options.length === 0) {
        return;
      }

      const optionValue = option.dataset.value ?? "";
      input.value = optionValue;
      value.textContent = option.textContent;
      wrapper.dataset.selectedLabel = optionValue ? option.textContent : "";
      options.forEach((item) =>
        item.classList.toggle("is-selected", item === option)
      );
      syncState();
      updateSummary();
      render();
    };

    const renderOptions = (wrapper) => {
      list.innerHTML = "";
      const options = Array.from(
        wrapper.querySelectorAll("[data-filter-option]")
      );
      const input = wrapper.querySelector("[data-filter-input]");
      const label = wrapper
        .closest(".c-field")
        ?.querySelector(".c-field__label");
      const filtersCopy = getFiltersCopy(currentLang);
      title.textContent = label ? label.textContent : filtersCopy.title || "Фильтр";
      options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "c-filter-select-modal__option";
        button.textContent = option.textContent;
        if (input && option.dataset.value === input.value) {
          button.classList.add("is-selected");
        }
        button.addEventListener("click", () => {
          applyOption(wrapper, option);
          closeModal();
        });
        list.appendChild(button);
      });
    };

    const setModalState = (isOpen) => {
      if (!isOpen && modal.contains(document.activeElement)) {
        const fallbackFocus =
          activeWrapper?.querySelector("[data-filter-trigger]") || document.body;
        if (fallbackFocus && typeof fallbackFocus.focus === "function") {
          fallbackFocus.focus();
        }
        if (modal.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }
      if (isOpen) {
        modal.removeAttribute("inert");
        modal.inert = false;
      } else {
        modal.setAttribute("inert", "");
        modal.inert = true;
      }
      modal.setAttribute("data-state", isOpen ? "open" : "closed");
      modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.style.overflow = isOpen ? "hidden" : "";
      if (activeWrapper) {
        const trigger = activeWrapper.querySelector("[data-filter-trigger]");
        if (trigger) {
          trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
      }
      if (isOpen) {
        const focusable = getFocusable(modal);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
        document.addEventListener("keydown", handleKeydown);
      } else {
        document.removeEventListener("keydown", handleKeydown);
      }
    };

    const openModal = (wrapper) => {
      activeWrapper = wrapper;
      lastFocused = document.activeElement;
      renderOptions(wrapper);
      setModalState(true);
    };

    const closeModal = () => {
      if (modal.getAttribute("data-state") === "closed") {
        return;
      }
      if (modal.contains(document.activeElement)) {
        const fallback =
          lastFocused ||
          activeWrapper?.querySelector("[data-filter-trigger]") ||
          document.body;
        if (fallback && typeof fallback.focus === "function") {
          fallback.focus();
        }
      }
      setModalState(false);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable(modal);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = event.shiftKey;

      if (isShift && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!isShift && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    wrappers.forEach((wrapper) => {
      const trigger = wrapper.querySelector("[data-filter-trigger]");
      const input = wrapper.querySelector("[data-filter-input]");
      const options = Array.from(
        wrapper.querySelectorAll("[data-filter-option]")
      );

      if (!trigger || !input || options.length === 0) {
        return;
      }

      const current = options.find(
        (option) => option.dataset.value === input.value
      );
      if (current) {
        applyOption(wrapper, current);
      } else {
        applyOption(wrapper, options[0]);
      }

      const handleOpen = (event) => {
        event.preventDefault();
        event.stopPropagation();
        openModal(wrapper);
      };

      trigger.addEventListener("click", handleOpen);
    });

    overlay.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    modal.setAttribute("data-state", "closed");
    modal.setAttribute("aria-hidden", "true");
  }

  function setupFiltersModal() {
    if (!filtersModal || !filtersForm || !filtersOpen) {
      return;
    }

    const filterSelectModal = document.querySelector(
      "[data-filter-select-modal]"
    );

    let lastFocused = null;

    const setState = (isOpen) => {
      if (!isOpen && filtersModal.contains(document.activeElement)) {
        filtersOpen.focus();
      }
      filtersModal.setAttribute("data-state", isOpen ? "open" : "closed");
      filtersModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
      filtersOpen.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";

      if (isOpen) {
        const focusable = getFocusable(filtersModal);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
        document.addEventListener("keydown", handleKeydown);
      } else {
        document.removeEventListener("keydown", handleKeydown);
      }
    };

    const openModal = () => {
      if (filtersModal.getAttribute("data-state") === "open") {
        return;
      }
      lastFocused = document.activeElement;
      setState(true);
    };

    const closeModal = () => {
      if (filtersModal.getAttribute("data-state") === "closed") {
        return;
      }
      setState(false);
      if (filterSelectModal) {
        filterSelectModal.setAttribute("data-state", "closed");
        filterSelectModal.setAttribute("aria-hidden", "true");
      }
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable(filtersModal);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = event.shiftKey;

      if (isShift && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!isShift && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    filtersOpen.addEventListener("click", openModal);

    if (filtersOverlay) {
      filtersOverlay.addEventListener("click", closeModal);
    }

    if (filtersClose) {
      filtersClose.addEventListener("click", closeModal);
    }

    if (filtersApply) {
      filtersApply.addEventListener("click", closeModal);
    }

    filtersModal.setAttribute("data-state", "closed");
    filtersModal.setAttribute("aria-hidden", "true");
    filtersOpen.setAttribute("aria-expanded", "false");
  }
}

function applyCatalogCopy(filtersForm, list) {
  if (!cachedCopy) {
    return;
  }

  const lang = currentLang;
  const catalogCopy = getCatalogCopy(lang);
  const filtersCopy = getFiltersCopy(lang);
  const searchCopy = cachedCopy?.ui?.search?.[lang] || {};

  const catalogSection = document.querySelector("#catalog");
  if (catalogSection) {
    const eyebrow = catalogSection.querySelector(".c-section__eyebrow");
    const title = catalogSection.querySelector(".c-section__title");
    if (eyebrow && catalogCopy.eyebrow) {
      eyebrow.textContent = catalogCopy.eyebrow;
    }
    if (title && catalogCopy.title) {
      title.textContent = catalogCopy.title;
    }
  }

  const filtersOpen = document.querySelector("[data-filters-open]");
  if (filtersOpen && catalogCopy.filtersButton) {
    filtersOpen.textContent = catalogCopy.filtersButton;
  }

  const filtersTitle = document.querySelector("#filters-modal-title");
  if (filtersTitle && filtersCopy.modalTitle) {
    filtersTitle.textContent = filtersCopy.modalTitle;
  }

  const filtersApply = document.querySelector("[data-filters-apply]");
  if (filtersApply && filtersCopy.apply) {
    filtersApply.textContent = filtersCopy.apply;
  }

  const filtersClose = document.querySelector("[data-filters-close]");
  if (filtersClose && searchCopy.modalClose) {
    filtersClose.setAttribute("aria-label", searchCopy.modalClose);
  }

  const filterSelectClose = document.querySelector("[data-filter-select-close]");
  if (filterSelectClose && searchCopy.modalClose) {
    filterSelectClose.setAttribute("aria-label", searchCopy.modalClose);
  }

  if (filtersForm) {
    updateFilterLabels(filtersForm, filtersCopy);
    updateFilterOptions(filtersForm, filtersCopy);
  }

  if (list) {
    list.querySelectorAll(".c-card--skeleton span").forEach((span) => {
      if (catalogCopy.loading) {
        span.textContent = catalogCopy.loading;
      }
    });
  }
}

function updateFilterLabels(form, filtersCopy) {
  const updateLabel = (key, text) => {
    const wrapper = form.querySelector(
      `[data-filter-select][data-filter-key='${key}']`
    );
    const label = wrapper?.closest(".c-field")?.querySelector(".c-field__label");
    if (label && text) {
      label.textContent = text;
    }
  };

  updateLabel("country", filtersCopy.country);
  updateLabel("days", filtersCopy.duration);
  updateLabel("people", filtersCopy.people);
  updateLabel("rating", filtersCopy.rating);

  const periodLabel = form
    .querySelector("[name='periodStart']")
    ?.closest(".c-field")
    ?.querySelector(".c-field__label");
  if (periodLabel && filtersCopy.period) {
    periodLabel.textContent = filtersCopy.period;
  }

  const priceLabel = form
    .querySelector("[name='price']")
    ?.closest(".c-field")
    ?.querySelector(".c-field__label");
  if (priceLabel && filtersCopy.priceLabel) {
    priceLabel.textContent = filtersCopy.priceLabel;
  }
}

function updateFilterOptions(form, filtersCopy) {
  const updateOptions = (key, anyLabel, options, values) => {
    const wrapper = form.querySelector(
      `[data-filter-select][data-filter-key='${key}']`
    );
    if (!wrapper) {
      return;
    }
    const optionNodes = Array.from(
      wrapper.querySelectorAll("[data-filter-option]")
    );
    optionNodes.forEach((option) => {
      const value = option.dataset.value ?? "";
      if (!value) {
        if (anyLabel) {
          option.textContent = anyLabel;
        }
        return;
      }
      const index = values.indexOf(value);
      if (index > -1 && options?.[index]) {
        option.textContent = options[index];
      }
    });
    const currentValue = form[key]?.value || "";
    setFilterSelectValue(form, key, currentValue);
  };

  updateOptions(
    "days",
    filtersCopy.anyDuration,
    filtersCopy.daysOptions,
    ["4-6", "7-8", "9+"]
  );
  updateOptions(
    "people",
    filtersCopy.anyPeople,
    filtersCopy.peopleOptions,
    ["1", "2", "3", "4"]
  );
  updateOptions(
    "rating",
    filtersCopy.anyRating,
    filtersCopy.ratingOptions,
    ["4.6", "4.8"]
  );

  const dateValue = form.querySelector("[data-date-value]");
  if (dateValue && filtersCopy.periodPlaceholder) {
    const start = form.querySelector("[name='periodStart']");
    const end = form.querySelector("[name='periodEnd']");
    if (!start?.value && !end?.value) {
      dateValue.textContent = filtersCopy.periodPlaceholder;
    }
  }
}

function updateCountryOptions(form, tours, lang) {
  if (!form || !Array.isArray(tours)) {
    return;
  }
  const wrapper = form.querySelector(
    "[data-filter-select][data-filter-key='country']"
  );
  if (!wrapper) {
    return;
  }

  const filtersCopy = getFiltersCopy(lang);
  const menu = wrapper.querySelector("[data-filter-menu]");
  if (!menu) {
    return;
  }

  const countries = new Map();
  tours.forEach((tour) => {
    const key = tour.location?.countryKey;
    const label = getLocalizedValue(tour.location?.country, lang);
    if (key && label && !countries.has(key)) {
      countries.set(key, label);
    }
  });

  const sorted = Array.from(countries.entries()).sort((a, b) =>
    a[1].localeCompare(b[1], getLocale(lang))
  );

  menu.innerHTML = "";
  const anyButton = document.createElement("button");
  anyButton.className = "c-filter-select__option";
  anyButton.type = "button";
  anyButton.setAttribute("data-filter-option", "");
  anyButton.dataset.value = "";
  anyButton.textContent = filtersCopy.anyCountry || "Любая";
  menu.appendChild(anyButton);

  sorted.forEach(([value, label]) => {
    const button = document.createElement("button");
    button.className = "c-filter-select__option";
    button.type = "button";
    button.setAttribute("data-filter-option", "");
    button.dataset.value = value;
    button.textContent = label;
    menu.appendChild(button);
  });

  setFilterSelectValue(form, "country", form.country?.value || "");
}

function buildTourCard(tour) {
  const lang = currentLang;
  const tourCardCopy = cachedCopy?.ui?.tourCard?.[lang] || {};
  const card = document.createElement("article");
  card.className = "c-card";

  const media = document.createElement("div");
  media.className = "c-card__media media-frame";
  media.style.setProperty("--media-ratio", "4 / 3");

  media.innerHTML = createPicture(
    tour.images?.[0],
    getLocalizedValue(tour.title, lang) || "Tour"
  );

  const body = document.createElement("div");
  body.className = "c-card__body";

  const meta = document.createElement("div");
  meta.className = "c-card__meta";

  if (Array.isArray(tour.badges) && tour.badges.length > 0) {
    const badgeKey = tour.badges[0];
    const badge = document.createElement("span");
    const badgeLabel = getBadgeLabel(lang, badgeKey) || "Spec";
    const badgeClass = BADGE_CLASS[badgeKey] || "";
    badge.className = `c-badge${badgeClass ? ` ${badgeClass}` : ""}`;
    badge.textContent = badgeLabel;
    meta.appendChild(badge);
  }

  const countryLabel = getLocalizedValue(tour.location?.country, lang);
  if (countryLabel) {
    const country = document.createElement("span");
    country.className = "c-badge c-badge--muted c-card__country";
    country.textContent = countryLabel;
    meta.appendChild(country);
  }

  const title = document.createElement("h3");
  title.className = "c-card__title";
  title.textContent = getLocalizedValue(tour.title, lang);

  const description = document.createElement("p");
  description.textContent = getLocalizedValue(tour.shortDescription, lang);

  const details = document.createElement("div");
  details.className = "c-card__meta";
  const daysLabel = tourCardCopy.days || "дней";
  details.textContent = `${tour.days} ${daysLabel} · ${tour.rating} ★ · €${tour.priceEUR}`;

  const actions = document.createElement("div");
  actions.className = "c-card__actions";

  const link = document.createElement("a");
  link.className = "c-button c-button--ghost";
  link.href = `./tour.html?id=${tour.id}`;
  link.textContent = tourCardCopy.details || "Подробнее";

  actions.appendChild(link);

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(description);
  body.appendChild(details);
  body.appendChild(actions);

  card.appendChild(media);
  card.appendChild(body);

  return card;
}

function createPicture(src, altText) {
  if (!src) {
    return "";
  }
  const safeAlt = altText ? altText.replace(/"/g, "&quot;") : "";
  const sources = buildSources(src);
  return `<picture>
    ${sources}
    <img src="${src}" alt="${safeAlt}" loading="lazy" decoding="async">
  </picture>`;
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

function setFilterSelectValue(form, key, value) {
  const wrapper = form.querySelector(
    `[data-filter-select][data-filter-key='${key}']`
  );
  if (!wrapper) {
    if (form?.[key]) {
      form[key].value = value;
    }
    return;
  }
  const option = wrapper.querySelector(
    `[data-filter-option][data-value='${value}']`
  );
  const fallback = wrapper.querySelector("[data-filter-option]");
  const target = option || fallback;
  if (target) {
    const valueEl = wrapper.querySelector("[data-filter-value]");
    const input = wrapper.querySelector("[data-filter-input]");
    const options = Array.from(wrapper.querySelectorAll("[data-filter-option]"));
    if (valueEl && input) {
      input.value = target.dataset.value ?? "";
      valueEl.textContent = target.textContent;
      wrapper.dataset.selectedLabel = input.value ? target.textContent : "";
      options.forEach((item) =>
        item.classList.toggle("is-selected", item === target)
      );
    }
  }
}

function applyFilters(tours, state) {
  return tours.filter((tour) => {
    if (state.country && tour.location?.countryKey !== state.country) {
      return false;
    }

    if (state.price && tour.priceEUR > state.price) {
      return false;
    }

    if (state.days && !matchDuration(tour.days, state.days)) {
      return false;
    }

    if (
      state.periodStart &&
      state.periodEnd &&
      !isTourAvailable(tour, state.periodStart, state.periodEnd)
    ) {
      return false;
    }

    if (state.people && tour.travelerCapacity < Number(state.people)) {
      return false;
    }

    if (state.rating && tour.rating < Number(state.rating)) {
      return false;
    }

    return true;
  });
}

function isTourAvailable(tour, periodStart, periodEnd) {
  const startValue = toDateValue(periodStart);
  const endValue = toDateValue(periodEnd);

  if (!startValue || !endValue || endValue < startValue) {
    return true;
  }

  const busyPeriods = Array.isArray(tour.busyPeriods) ? tour.busyPeriods : [];

  return !busyPeriods.some((period) => {
    const busyStart = toDateValue(period.start);
    const busyEnd = toDateValue(period.end);

    if (!busyStart || !busyEnd) {
      return false;
    }

    return startValue <= busyEnd && endValue >= busyStart;
  });
}

function toDateValue(value) {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.getTime();
}

function getFocusable(container) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll(selectors));
}

function matchDuration(days, filterValue) {
  if (!days) {
    return false;
  }

  if (filterValue === "4-6") {
    return days >= 4 && days <= 6;
  }

  if (filterValue === "7-8") {
    return days >= 7 && days <= 8;
  }

  if (filterValue === "9+") {
    return days >= 9;
  }

  return true;
}

function debounce(fn, delay) {
  let timerId;

  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
