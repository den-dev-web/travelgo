export default function initBackToTop() {
  const triggers = document.querySelectorAll("[data-back-to-top]");
  if (!triggers.length) {
    return;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
