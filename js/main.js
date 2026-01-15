import initAccordion from "./modules/accordion.js";
import initCatalog from "./modules/catalog.js";
import initMenu from "./modules/menu.js";
import initReveal from "./modules/reveal.js";
import initReviews from "./modules/reviews.js";
import initSearchForm from "./modules/search-form.js";
import initSubscribe from "./modules/subscribe.js";
import initTourPage from "./modules/tour-page.js";
import initHeroSlider from "./modules/hero-slider.js";
import initBackToTop from "./modules/back-to-top.js";
import initPreferences from "./modules/preferences.js";
import initLocalization from "./modules/localize.js";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initAccordion();
  initCatalog();
  initReveal();
  initReviews();
  initSearchForm();
  initSubscribe();
  initTourPage();
  initHeroSlider();
  initBackToTop();
  initPreferences();
  initLocalization();
});
