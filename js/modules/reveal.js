export default function initReveal() {
  const targets = document.querySelectorAll(".c-reveal");
  if (!targets.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((target) => {
      target.setAttribute("data-visible", "true");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((target) => observer.observe(target));
}
