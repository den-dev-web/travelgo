import { getCurrentLang, getUiCopy } from "./i18n.js";

let cachedCopy;

export default function initSubscribe() {
  const form = document.querySelector("[data-subscribe-form]");
  const status = document.querySelector("[data-subscribe-status]");

  if (!form) {
    return;
  }

  getUiCopy()
    .then((copy) => {
      cachedCopy = copy;
    })
    .catch(() => {});

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailField = form.querySelector("[name='email']");
    const submitButton = form.querySelector("button[type='submit']");
    const error = form.querySelector("#subscribe-email-error");

    if (!emailField) {
      return;
    }

    const email = emailField.value.trim();
    const isValid = emailField.checkValidity();

    if (!isValid) {
      const lang = getCurrentLang();
      const message =
        cachedCopy?.ui?.messages?.[lang]?.emailInvalid || "Введите корректный email.";
      if (error) {
        error.textContent = message;
      }
      form.querySelectorAll("[data-field]").forEach((field) => {
        field.setAttribute("data-invalid", "true");
      });
      if (status) {
        status.textContent = message;
      }
      return;
    }

    if (error) {
      error.textContent = "";
    }
    form.querySelectorAll("[data-field]").forEach((field) => {
      field.setAttribute("data-invalid", "false");
    });

    if (submitButton) {
      submitButton.setAttribute("data-loading", "true");
      submitButton.disabled = true;
    }

    if (status) {
      const lang = getCurrentLang();
      const message =
        cachedCopy?.ui?.newsletter?.[lang]?.loading || "Отправляем...";
      status.textContent = message;
    }

    try {
      const response = await fetch("./data/ui-copy.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      if (status) {
        const lang = getCurrentLang();
        const message =
          cachedCopy?.ui?.newsletter?.[lang]?.success || "Спасибо! Вы подписаны.";
        status.textContent = message;
      }
      form.reset();
    } catch (error) {
      if (status) {
        const lang = getCurrentLang();
        const message =
          cachedCopy?.ui?.newsletter?.[lang]?.error ||
          "Не удалось отправить. Попробуйте позже.";
        status.textContent = message;
      }
    } finally {
      if (submitButton) {
        submitButton.removeAttribute("data-loading");
        submitButton.disabled = false;
      }
    }
  });
}
