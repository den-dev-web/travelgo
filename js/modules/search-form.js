import { getCurrentLang, getLocale, getLocalizedValue, getUiCopy } from "./i18n.js";

let dateRangeController;
let cachedCopy;

export default function initSearchForm() {
  const form = document.querySelector("[data-search-form]");
  const status = document.querySelector("[data-search-status]");
  const filters = document.querySelector("[data-filters]");
  const catalog = document.querySelector("#catalog");

  if (!form) {
    return;
  }

  initDateRangePicker(form);
  if (filters) {
    initDateRangePicker(filters);
  }
  initCustomSelects(form);

  getUiCopy()
    .then((copy) => {
      cachedCopy = copy;
      applySearchCopy(form, filters, copy, getCurrentLang());
    })
    .catch(() => {});

  document.addEventListener("lang:change", (event) => {
    const nextLang = event.detail?.lang || getCurrentLang();
    if (cachedCopy) {
      applySearchCopy(form, filters, cachedCopy, nextLang);
    }
    dateRangeController?.refresh?.();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const destination = (values.get("destination") || "").toString().trim();
    const start = values.get("start");
    const end = values.get("end");
    const people = (values.get("people") || "").toString().trim();
    const daysRange = getDaysRange(start, end);

    applyFieldErrors(form, new Map());

    if (status) {
      const lang = getCurrentLang();
      const message =
        cachedCopy?.ui?.search?.[lang]?.statusAccepted ||
        "Параметры приняты. Переходим к каталогу.";
      status.textContent = message;
    }

    if (filters) {
      const countrySelect = filters.querySelector("input[name='country']");
      const countryKey = destination;
      if (countrySelect) {
        countrySelect.value = countryKey;
      }
      applyFiltersFromSearch(filters, {
        countryKey,
        daysRange,
        people,
        periodStart: start || "",
        periodEnd: end || ""
      });
      filters.dataset.searchApply = JSON.stringify({
        countryKey,
        daysRange,
        people,
        periodStart: start || "",
        periodEnd: end || ""
      });
      const detail = {
        countryKey,
        daysRange,
        people,
        periodStart: start || "",
        periodEnd: end || ""
      };
      filters.dispatchEvent(new CustomEvent("search:apply", { detail }));
      document.dispatchEvent(new CustomEvent("search:apply", { detail }));
      document.dispatchEvent(new CustomEvent("filters:refresh"));
      filters.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function applySearchCopy(form, filters, copy, lang) {
  if (!form || !copy) {
    return;
  }

  const searchCopy = copy.ui?.search?.[lang];
  if (!searchCopy) {
    return;
  }

  const section = form.closest("section");
  const eyebrow = section?.querySelector(".c-section__eyebrow");
  const title = section?.querySelector(".c-section__title");
  if (eyebrow && searchCopy.eyebrow) {
    eyebrow.textContent = searchCopy.eyebrow;
  }
  if (title && searchCopy.title) {
    title.textContent = searchCopy.title;
  }

  setFieldLabel(form, "destination", searchCopy.destination);

  const rangeLabel = form.querySelector("[data-field-range] .c-field__label");
  if (rangeLabel && searchCopy.modalTitle) {
    rangeLabel.textContent = searchCopy.modalTitle;
  }

  setFieldLabel(form, "people", searchCopy.travelers);

  const destinationValue = form.querySelector(
    "[data-select='destination'] [data-select-value]"
  );
  const destinationInput = form.querySelector("input[name='destination']");
  if (
    destinationValue &&
    searchCopy.destinationPlaceholder &&
    !destinationInput?.value
  ) {
    destinationValue.textContent = searchCopy.destinationPlaceholder;
  }

  const startInput = form.querySelector("[data-date-start]");
  const endInput = form.querySelector("[data-date-end]");
  const dateValue = form.querySelector("[data-date-value]");
  if (dateValue && searchCopy.datePlaceholder && !startInput?.value && !endInput?.value) {
    dateValue.textContent = searchCopy.datePlaceholder;
  }

  const peopleValue = form.querySelector(
    "[data-select='people'] [data-select-value]"
  );
  const peopleInput = form.querySelector("input[name='people']");
  if (peopleValue && searchCopy.peoplePlaceholder && !peopleInput?.value) {
    peopleValue.textContent = searchCopy.peoplePlaceholder;
  }

  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton && searchCopy.submit) {
    submitButton.textContent = searchCopy.submit;
  }

  const status = section?.querySelector("[data-search-status]");
  if (status && searchCopy.helper) {
    status.textContent = searchCopy.helper;
  }

  const selectClose = document.querySelector("[data-select-close]");
  if (selectClose && searchCopy.modalClose) {
    selectClose.setAttribute("aria-label", searchCopy.modalClose);
  }

  const dateClose = document.querySelector("[data-date-close]");
  if (dateClose && searchCopy.modalClose) {
    dateClose.setAttribute("aria-label", searchCopy.modalClose);
  }

  const dateTitle = document.querySelector("#date-modal-title");
  if (dateTitle && searchCopy.modalTitle) {
    dateTitle.textContent = searchCopy.modalTitle;
  }

  const dateStartLabel = document.querySelector(
    "[data-date-input='start']"
  )?.closest(".c-field")?.querySelector(".c-field__label");
  if (dateStartLabel && searchCopy.startDate) {
    dateStartLabel.textContent = searchCopy.startDate;
  }

  const dateEndLabel = document.querySelector(
    "[data-date-input='end']"
  )?.closest(".c-field")?.querySelector(".c-field__label");
  if (dateEndLabel && searchCopy.endDate) {
    dateEndLabel.textContent = searchCopy.endDate;
  }

  const dateApply = document.querySelector("[data-date-apply]");
  if (dateApply && searchCopy.modalApply) {
    dateApply.textContent = searchCopy.modalApply;
  }
}

function setFieldLabel(form, name, label) {
  if (!label) {
    return;
  }
  const input = form.querySelector(`[name='${name}']`);
  const field = input?.closest(".c-field");
  const node = field?.querySelector(".c-field__label");
  if (node) {
    node.textContent = label;
  }
}

function applyFieldErrors(form, errors) {
  const fields = form.querySelectorAll("[data-field]");

  fields.forEach((field) => {
    const input = field.querySelector("input, select, textarea");
    const error = field.querySelector(".c-field__error");

    if (!input) {
      return;
    }

    const message = field.hasAttribute("data-field-range")
      ? errors.get("dateRange") || ""
      : errors.get(input.name) || "";
    field.setAttribute("data-invalid", message ? "true" : "false");

    if (error) {
      error.textContent = message;
    }
  });
}

async function loadDestinationOptions(lang) {
  try {
    const response = await fetch("./data/tours.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load tours");
    }
    const data = await response.json();
    const tours = Array.isArray(data.tours) ? data.tours : [];

    const countries = new Map();
    tours.forEach((tour) => {
      const key = tour.location?.countryKey;
      const label = getLocalizedValue(tour.location?.country, lang);
      if (key && label && !countries.has(key)) {
        countries.set(key, label);
      }
    });

    return Array.from(countries.entries())
      .sort((a, b) => a[1].localeCompare(b[1], getLocale(lang)))
      .map(([value, label]) => ({ value, label }));
  } catch (error) {
    return [];
  }
}

function initDateRangePicker(form) {
  const controller = getDateRangeController();
  if (!controller || !form) {
    return;
  }
  controller.register(form);
}

function getDateRangeController() {
  if (dateRangeController) {
    return dateRangeController;
  }

  const modal = document.querySelector("[data-date-modal]");

  if (!modal) {
    return null;
  }

  const overlay = modal.querySelector("[data-date-overlay]");
  const closeButton = modal.querySelector("[data-date-close]");
  const applyButton = modal.querySelector("[data-date-apply]");
  const calendars = modal.querySelector("[data-date-calendars]");
  const startInput = modal.querySelector("[data-date-input='start']");
  const endInput = modal.querySelector("[data-date-input='end']");

  if (!overlay || !calendars || !startInput || !endInput) {
    return null;
  }

  const today = new Date();
  const todayValue = formatDateValue(today);

  startInput.min = todayValue;
  endInput.min = todayValue;

  const registeredTriggers = new WeakSet();
  const instances = [];
  let active = null;

  const syncEndMin = () => {
    endInput.min = startInput.value || todayValue;
  };

  const setModalState = (isOpen) => {
    modal.setAttribute("data-state", isOpen ? "open" : "closed");
    modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.style.overflow = isOpen ? "hidden" : "";

    if (active && active.trigger) {
      active.trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
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

  const syncInstanceFromInputs = (instance) => {
    instance.state.start = instance.startHidden.value || "";
    instance.state.end = instance.endHidden.value || "";
  };

  const updateTrigger = (instance) => {
    syncInstanceFromInputs(instance);
    if (instance.state.start && instance.state.end) {
      const startDate = parseDateValue(instance.state.start);
      const endDate = parseDateValue(instance.state.end);
      instance.value.textContent = `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;
      instance.trigger.classList.remove("is-placeholder");
    } else {
      const placeholder =
        cachedCopy?.ui?.search?.[getCurrentLang()]?.datePlaceholder ||
        "Выберите даты";
      instance.value.textContent = placeholder;
      instance.trigger.classList.add("is-placeholder");
    }
  };

  const openModal = (instance) => {
    active = instance;
    active.state.lastFocused = document.activeElement;
    syncInstanceFromInputs(active);
    active.state.draftStart = active.state.start;
    active.state.draftEnd = active.state.end;
    startInput.value = active.state.draftStart;
    endInput.value = active.state.draftEnd;
    syncEndMin();
    renderCalendars();
    setModalState(true);
  };

  const closeModal = () => {
    if (modal.getAttribute("data-state") === "closed") {
      return;
    }
    const lastFocused = active?.state.lastFocused;
    setModalState(false);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    active = null;
  };

  const applyDraft = () => {
    if (!active) {
      return;
    }
    active.state.start = active.state.draftStart;
    active.state.end = active.state.draftEnd;
    active.startHidden.value = active.state.start;
    active.endHidden.value = active.state.end;
    updateTrigger(active);
    active.startHidden.dispatchEvent(new Event("change", { bubbles: true }));
    active.endHidden.dispatchEvent(new Event("change", { bubbles: true }));
    const field = active.trigger.closest("[data-field]");
    if (field) {
      field.setAttribute("data-invalid", "false");
      const error = field.querySelector(".c-field__error");
      if (error) {
        error.textContent = "";
      }
    }
    closeModal();
  };

  const updateDraftFromInputs = () => {
    if (!active) {
      return;
    }
    active.state.draftStart = startInput.value;
    active.state.draftEnd = endInput.value;

    if (
      active.state.draftStart &&
      active.state.draftEnd &&
      active.state.draftEnd < active.state.draftStart
    ) {
      active.state.draftEnd = "";
      endInput.value = "";
    }

    syncEndMin();
    renderCalendars();
  };

  const handleDayClick = (value) => {
    if (!active || !value) {
      return;
    }
    if (!active.state.draftStart || (active.state.draftStart && active.state.draftEnd)) {
      active.state.draftStart = value;
      active.state.draftEnd = "";
    } else if (value < active.state.draftStart) {
      active.state.draftStart = value;
      active.state.draftEnd = "";
    } else {
      active.state.draftEnd = value;
    }

    startInput.value = active.state.draftStart;
    endInput.value = active.state.draftEnd;
    syncEndMin();
    renderCalendars();
  };

  const renderCalendars = () => {
    if (!active) {
      return;
    }
    calendars.innerHTML = "";
    const base = new Date();
    base.setDate(1);
    const months = [new Date(base), addMonths(base, 1)];

    months.forEach((monthDate) => {
      calendars.appendChild(buildMonth(monthDate));
    });
  };

  const buildMonth = (monthDate) => {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startOffset = getMondayIndex(firstDay.getDay());
    const monthStartLabel = monthDate.toLocaleDateString(getLocale(getCurrentLang()), {
      month: "long",
      year: "numeric"
    });

    const wrapper = document.createElement("div");
    wrapper.className = "c-date-calendar";

    const header = document.createElement("div");
    header.className = "c-date-calendar__header";
    header.textContent = capitalize(monthStartLabel);
    wrapper.appendChild(header);

    const weekdays = document.createElement("div");
    weekdays.className = "c-date-calendar__weekdays";
    const weekdayLabels = {
      en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      uk: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
      ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    };
    const lang = getCurrentLang();
    (weekdayLabels[lang] || weekdayLabels.uk).forEach((label) => {
      const span = document.createElement("span");
      span.textContent = label;
      weekdays.appendChild(span);
    });
    wrapper.appendChild(weekdays);

    const grid = document.createElement("div");
    grid.className = "c-date-calendar__grid";

    for (let i = 0; i < startOffset; i += 1) {
      const empty = document.createElement("span");
      empty.className = "c-date-calendar__empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const cellDate = new Date(year, month, day);
      const value = formatDateValue(cellDate);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "c-date-calendar__day";
      button.textContent = String(day);
      button.dataset.date = value;

      const isPast = value < todayValue;
      if (isPast) {
        button.disabled = true;
        button.classList.add("is-disabled");
      }

      const isStart = active?.state.draftStart === value;
      const isEnd = active?.state.draftEnd === value;

      if (isStart) {
        button.classList.add("is-start");
      }
      if (isEnd) {
        button.classList.add("is-end");
      }

      if (
        active?.state.draftStart &&
        active?.state.draftEnd &&
        value > active.state.draftStart &&
        value < active.state.draftEnd
      ) {
        button.classList.add("is-in-range");
      }

      if (value === todayValue) {
        button.classList.add("is-today");
      }

      button.addEventListener("click", () => handleDayClick(value));
      grid.appendChild(button);
    }

    wrapper.appendChild(grid);
    return wrapper;
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

  startInput.addEventListener("change", updateDraftFromInputs);
  endInput.addEventListener("change", updateDraftFromInputs);
  overlay.addEventListener("click", closeModal);
  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }
  if (applyButton) {
    applyButton.addEventListener("click", applyDraft);
  }

  modal.setAttribute("data-state", "closed");
  modal.setAttribute("aria-hidden", "true");

  dateRangeController = {
    register(form) {
      const trigger = form.querySelector("[data-date-trigger]");
      const value = form.querySelector("[data-date-value]");
      const startHidden = form.querySelector("[data-date-start]");
      const endHidden = form.querySelector("[data-date-end]");

      if (!trigger || !value || !startHidden || !endHidden) {
        return;
      }

      if (registeredTriggers.has(trigger)) {
        return;
      }

      const instance = {
        trigger,
        value,
        startHidden,
        endHidden,
        state: {
          start: "",
          end: "",
          draftStart: "",
          draftEnd: "",
          lastFocused: null
        }
      };

      registeredTriggers.add(trigger);
      instances.push(instance);
      trigger.addEventListener("click", () => openModal(instance));
      updateTrigger(instance);
    },
    refresh() {
      instances.forEach((instance) => updateTrigger(instance));
    }
  };

  return dateRangeController;
}

export function initCustomSelects(form) {
  const modal = document.querySelector("[data-select-modal]");

  if (!modal) {
    return;
  }

  const overlay = modal.querySelector("[data-select-overlay]");
  const closeButton = modal.querySelector("[data-select-close]");
  const title = modal.querySelector("[data-select-title]");
  const list = modal.querySelector("[data-select-list]");
  const triggers = Array.from(form.querySelectorAll("[data-select-trigger]"));

  if (!title || !list || triggers.length === 0) {
    return;
  }

  const state = {
    activeKey: null,
    lastFocused: null,
    destinationOptions: [],
    peopleOptions: [],
    lang: getCurrentLang(),
    copy: cachedCopy
  };

  const selects = new Map();

  triggers.forEach((trigger) => {
    const wrapper = trigger.closest("[data-select]");
    const input = wrapper?.querySelector("[data-select-input]");
    const value = wrapper?.querySelector("[data-select-value]");
    const key = wrapper?.getAttribute("data-select");

    if (!wrapper || !input || !value || !key) {
      return;
    }

    selects.set(key, { trigger, value, input, field: wrapper.closest("[data-field]") });
    trigger.addEventListener("click", () => openModal(key));
  });

  const updateOptions = async (lang, copy) => {
    state.lang = lang;
    state.copy = copy || state.copy;
    state.peopleOptions = buildPeopleOptions(state.lang, state.copy);
    state.destinationOptions = await loadDestinationOptions(state.lang);
    const people = selects.get("people");
    if (people) {
      const defaultValue =
        people.input.value || people.trigger.closest("[data-select]")?.dataset.defaultValue;
      const preset = state.peopleOptions.find((item) => item.value === defaultValue);
      if (preset) {
        setSelectValue(people, preset);
      }
    }
    updateSelectLabels();
  };

  const updateSelectLabels = () => {
    const destination = selects.get("destination");
    if (destination) {
      const placeholder =
        state.copy?.ui?.search?.[state.lang]?.destinationPlaceholder || "";
      if (destination.input.value) {
        const selected = state.destinationOptions.find(
          (item) => item.value === destination.input.value
        );
        if (selected) {
          setSelectValue(destination, selected);
        }
      } else if (placeholder) {
        destination.value.textContent = placeholder;
        destination.trigger.classList.add("is-placeholder");
      }
    }

    const people = selects.get("people");
    if (people) {
      const placeholder =
        state.copy?.ui?.search?.[state.lang]?.peoplePlaceholder || "";
      if (people.input.value) {
        const selected = state.peopleOptions.find(
          (item) => item.value === people.input.value
        );
        if (selected) {
          setSelectValue(people, selected);
        }
      } else if (placeholder) {
        people.value.textContent = placeholder;
        people.trigger.classList.add("is-placeholder");
      }
    }
  };

  updateOptions(state.lang, state.copy);
  if (!state.copy) {
    getUiCopy()
      .then((copy) => {
        cachedCopy = copy;
        updateOptions(getCurrentLang(), copy);
      })
      .catch(() => {});
  }

  document.addEventListener("lang:change", (event) => {
    const nextLang = event.detail?.lang || getCurrentLang();
    updateOptions(nextLang, cachedCopy);
  });

  const openModal = (key) => {
    if (!selects.has(key)) {
      return;
    }

    state.activeKey = key;
    state.lastFocused = document.activeElement;
    renderOptions();
    setModalState(true);
  };

  const closeModal = () => {
    if (modal.getAttribute("data-state") === "closed") {
      return;
    }
    setModalState(false);
    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
  };

  const setModalState = (isOpen) => {
    modal.setAttribute("data-state", isOpen ? "open" : "closed");
    modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
    document.body.style.overflow = isOpen ? "hidden" : "";
    const activeSelect = selects.get(state.activeKey);
    if (activeSelect) {
      activeSelect.trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
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

  const renderOptions = () => {
    const activeSelect = selects.get(state.activeKey);
    if (!activeSelect) {
      return;
    }

    const searchCopy = state.copy?.ui?.search?.[state.lang];
    const defaultTitle = state.activeKey === "people" ? "Путешественники" : "Страна";
    title.textContent =
      state.activeKey === "people"
        ? searchCopy?.selectPeopleTitle || defaultTitle
        : searchCopy?.selectDestinationTitle || defaultTitle;
    list.innerHTML = "";

    const options =
      state.activeKey === "people" ? state.peopleOptions : state.destinationOptions;

    if (!options.length) {
      const empty = document.createElement("p");
      empty.className = "c-select-modal__empty";
      empty.textContent =
        state.copy?.ui?.search?.[state.lang]?.selectEmpty ||
        "Нет доступных вариантов.";
      list.appendChild(empty);
      return;
    }

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "c-select-modal__option";
      button.textContent = option.label;
      if (activeSelect.input.value === option.value) {
        button.classList.add("is-selected");
      }
      button.addEventListener("click", () => {
        setSelectValue(activeSelect, option);
        closeModal();
      });
      list.appendChild(button);
    });
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

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  modal.setAttribute("data-state", "closed");
  modal.setAttribute("aria-hidden", "true");

  return {
    refresh: (lang, copy) => updateOptions(lang, copy)
  };
}

function buildPeopleOptions(lang, copy) {
  const defaults = ["1 человек", "2 человека", "3 человека", "4 человека"];
  const labels = copy?.ui?.filters?.[lang]?.peopleOptions || defaults;
  return labels.map((label, index) => ({
    value: String(index + 1),
    label
  }));
}

function applyFiltersFromSearch(filters, detail) {
  if (!filters) {
    return;
  }

  const { countryKey, daysRange, people, periodStart, periodEnd } = detail || {};

  if (countryKey !== undefined) {
    setFilterSelectValue(filters, "country", countryKey);
  }
  if (daysRange !== undefined) {
    setFilterSelectValue(filters, "days", daysRange);
  }
  if (people !== undefined) {
    setFilterSelectValue(filters, "people", people);
  }
  if (periodStart !== undefined || periodEnd !== undefined) {
    setPeriodValues(filters, periodStart, periodEnd);
  }

  const fields = [
    filters.country,
    filters.days,
    filters.people,
    filters.periodStart,
    filters.periodEnd
  ];
  fields.forEach((field) => {
    if (!field) {
      return;
    }
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });

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
    const options = Array.from(
      wrapper.querySelectorAll("[data-filter-option]")
    );
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

function setPeriodValues(form, startValue, endValue) {
  const trigger = form.querySelector("[data-date-trigger]");
  const value = form.querySelector("[data-date-value]");
  const startInput = form.querySelector("[data-date-start]");
  const endInput = form.querySelector("[data-date-end]");

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

  value.textContent = "Выберите даты";
  trigger.classList.add("is-placeholder");
}

function formatPeriodDate(value) {
  const date = parsePeriodDate(value);
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
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

function getDaysRange(start, end) {
  if (!start || !end) {
    return "";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "";
  }

  if (endDate < startDate) {
    return "";
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((endDate - startDate) / msPerDay) + 1;

  if (days >= 4 && days <= 6) {
    return "4-6";
  }

  if (days >= 7 && days <= 8) {
    return "7-8";
  }

  if (days >= 9) {
    return "9+";
  }

  return "";
}

function setSelectValue(select, option) {
  select.input.value = option.value;
  select.value.textContent = option.label;
  select.trigger.classList.toggle("is-placeholder", !option.value);
  if (select.field) {
    select.field.setAttribute("data-invalid", "false");
    const error = select.field.querySelector(".c-field__error");
    if (error) {
      error.textContent = "";
    }
  }
}

function getFocusable(container) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  return Array.from(container.querySelectorAll(selectors));
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function formatDisplayDate(date) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString(getLocale(getCurrentLang()), {
    day: "2-digit",
    month: "short"
  });
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMondayIndex(dayIndex) {
  return dayIndex === 0 ? 6 : dayIndex - 1;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}
