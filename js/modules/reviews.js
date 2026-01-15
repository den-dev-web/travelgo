export default function initReviews() {
  const track = document.querySelector("[data-reviews-track]");
  const prevButton = document.querySelector("[data-reviews-prev]");
  const nextButton = document.querySelector("[data-reviews-next]");

  if (!track) {
    return;
  }

  const scrollByAmount = (direction) => {
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => scrollByAmount(-1));
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => scrollByAmount(1));
  }

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByAmount(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByAmount(1);
    }
  });
}
