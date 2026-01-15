export default function initHeroSlider() {
  const slidesWrap = document.querySelector(".c-hero__slides");
  if (!slidesWrap) {
    return;
  }

  const slides = Array.from(slidesWrap.querySelectorAll(".c-hero__slide"));
  if (slides.length < 2) {
    return;
  }

  const desktopQuery = window.matchMedia("(min-width: 900px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let timerId = null;
  let currentIndex = 0;

  const fadeDuration = 2000;
  const displayDuration = 6000;
  const intervalDuration = fadeDuration + displayDuration;

  const clearSlides = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    slides.forEach((slide) => slide.classList.remove("is-active"));
  };

  const startSlider = () => {
    clearSlides();
    currentIndex = 0;
    slides[currentIndex].classList.add("is-active");

    if (reducedMotionQuery.matches) {
      return;
    }

    timerId = window.setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      const prevIndex = currentIndex;

      slides[nextIndex].classList.add("is-active");
      currentIndex = nextIndex;

      window.setTimeout(() => {
        slides[prevIndex].classList.remove("is-active");
      }, fadeDuration);
    }, intervalDuration);
  };

  const handleState = () => {
    if (!desktopQuery.matches) {
      clearSlides();
      return;
    }
    startSlider();
  };

  handleState();
  desktopQuery.addEventListener("change", handleState);
  reducedMotionQuery.addEventListener("change", handleState);
}
