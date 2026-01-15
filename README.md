# TravelGo

TravelGo is a multi-page frontend project for a travel agency landing and tour catalog, focused on modern CSS architecture, accessibility, and performance-aware UI implementation.

🔗 Live demo: https://den-dev-web.github.io/travelgo/

---

## 📌 About the Project

TravelGo is designed as a portfolio and educational project that simulates a travel agency website with a tour catalog, individual tour pages, filtering, and search functionality.  
The project demonstrates how a **modern, scalable frontend** can be built using native web technologies without frameworks.

---

## ⚙️ Tech Stack

- **HTML5** — semantic markup, multi-page structure (`index.html`, `tour.html`)  
- **CSS** — ITCSS-based layering, BEM naming, mobile-first approach  
  - limited number of media queries  
  - fluid typography and spacing using `clamp()`  
- **JavaScript (ES Modules)** — modular logic without frameworks  
- **Data** — local JSON files loaded via `fetch`  
- **Assets** — images and videos stored in `assets/`

---

## 🧩 Architecture & Development Approach

- Modular JavaScript structure with functional modules and centralized initialization via `main.js`
- UI behavior driven by `data-*` attributes for component interaction
- Event delegation for dynamic lists and interactive elements
- Accessibility-first mindset:
  - ARIA attributes
  - correct landmark roles
  - keyboard-focusable interactive elements
- Performance-oriented decisions:
  - preloading key images
  - modern image formats (AVIF / WebP)
  - `loading="lazy"` where appropriate
- Motion-safe animations:
  - only `transform` and `opacity`
  - respect for `prefers-reduced-motion`

---

## ✨ Key Features

- Tour catalog with filtering options
- Individual tour pages with detailed information
- Search form for tours
- Reviews section
- Localization-ready structure
- Responsive and mobile-first layout
- Smooth UI animations and transitions

---

## 🎯 What This Project Demonstrates

- Ability to build multi-page frontend applications without frameworks
- Strong CSS architecture using ITCSS and BEM
- Data-driven UI using JSON and Fetch API
- Accessibility-aware interaction patterns
- Performance-conscious frontend implementation
- Scalable structure suitable for real-world landing pages

---

## 🧪 Local Development

The project is fully static and does not require a build step.

You can run it locally by:
- opening `index.html` directly in a browser, or
- serving the project via a simple static server

Example:
```bash
npx serve
