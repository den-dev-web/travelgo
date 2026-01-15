const DEFAULT_OPEN = "false";

export default function initAccordion() {
  const accordions = document.querySelectorAll("[data-accordion]");

  if (!accordions.length) {
    return;
  }

  accordions.forEach((accordion) => {
    const single = accordion.getAttribute("data-accordion") === "single";

    accordion.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-accordion-trigger]");
      if (!trigger) {
        return;
      }

      const item = trigger.closest("[data-accordion-item]");
      const panel = item ? item.querySelector("[data-accordion-panel]") : null;

      if (!item || !panel) {
        return;
      }

      const isOpen = item.getAttribute("data-open") === "true";

      if (single && !isOpen) {
        accordion
          .querySelectorAll("[data-accordion-item][data-open='true']")
          .forEach((openItem) => {
            setItemState(openItem, false);
          });
      }

      setItemState(item, !isOpen);
    });
  });

  document.querySelectorAll("[data-accordion-item]").forEach((item) => {
    const trigger = item.querySelector("[data-accordion-trigger]");
    const panel = item.querySelector("[data-accordion-panel]");

    if (!trigger || !panel) {
      return;
    }

    const isOpen = item.getAttribute("data-open") === "true";

    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";

    if (!item.hasAttribute("data-open")) {
      item.setAttribute("data-open", DEFAULT_OPEN);
    }
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll("[data-accordion-item]").forEach((item) => {
      if (item.getAttribute("data-open") !== "true") {
        return;
      }
      const panel = item.querySelector("[data-accordion-panel]");
      if (panel) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}

function setItemState(item, isOpen) {
  const trigger = item.querySelector("[data-accordion-trigger]");
  const panel = item.querySelector("[data-accordion-panel]");

  if (!trigger || !panel) {
    return;
  }

  item.setAttribute("data-open", isOpen ? "true" : "false");
  trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
}
