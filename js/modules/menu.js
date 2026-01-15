const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export default function initMenu() {
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-button]");
  const overlay = document.querySelector("[data-menu-overlay]");
  const closeButton = document.querySelector("[data-menu-close]");

  if (!menu || !toggle) {
    return;
  }

  let lastFocused = null;
  let previousBodyOverflow = "";
  let previousBodyPaddingRight = "";

  const getFocusable = () => Array.from(menu.querySelectorAll(FOCUSABLE_SELECTORS));

  const setState = (isOpen) => {
    menu.setAttribute("data-state", isOpen ? "open" : "closed");
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (overlay) {
      overlay.setAttribute("data-state", isOpen ? "open" : "closed");
    }
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    }
  };

  const openMenu = () => {
    if (menu.getAttribute("data-state") === "open") {
      return;
    }
    lastFocused = document.activeElement;
    setState(true);
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
    document.addEventListener("keydown", handleKeydown);
  };

  const closeMenu = () => {
    if (menu.getAttribute("data-state") === "closed") {
      return;
    }
    setState(false);
    document.removeEventListener("keydown", handleKeydown);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const toggleMenu = () => {
    const isOpen = menu.getAttribute("data-state") === "open";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusable();
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

  toggle.addEventListener("click", toggleMenu);

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeMenu);
  }

  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (link && menu.contains(link)) {
      closeMenu();
    }
  });

  menu.setAttribute("data-state", "closed");
  menu.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
}
