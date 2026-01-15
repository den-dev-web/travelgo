# **Frontend Codex Senior — HTML + CSS + JS Edition (2025–2026)**  
Универсальная «конституция фронтенда» для современных продуктовых проектов на чистом HTML + CSS + JavaScript.  
Без препроцессоров, без сборщиков CSS, только нативные технологии.

---

# 📘 **0. Миссия и Принципы Codex**

Этот документ создан как **универсальный корпоративный стандарт фронтенда**, которого может придерживаться любая продуктовая команда уровня 2025–2026.

Основные принципы:

- **Нативность** — никаких препроцессоров, только чистый CSS.  
- **Простота** — решения должны быть очевидными.  
- **Предсказуемость** — разработчики читают код без когнитивной нагрузки.  
- **Долговечность** — архитектура не ломается через год.  
- **Совместимость** — работает на любом стеке, любом сервере, любом окружении.  
- **Адаптивность** — интерфейс подстраивается под любые устройства.  
- **Продуктовый подход** — скорость, стабильность, тестируемость.  

---

# 🧱 **1. Архитектура проекта (без препроцессоров)**

## 1.1. Структура директорий

```
project/
├── index.html
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── typography.css
│   ├── layout.css
│   ├── components/
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── modal.css
│   │   └── form.css
│   ├── utils.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── events.js
│   │   └── storage.js
│   ├── modules/
│   │   ├── cart.js
│   │   ├── menu.js
│   │   └── slider.js
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

# 🎨 **2. CSS: архитектура уровня Senior (нативная ITCSS)**

## 2.1. Уровни CSS

### **1. Tokens (Design Tokens)**  
Используем CSS Custom Properties:

`css/tokens.css`
```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f7f7f7;
  --color-text: #111;
  --color-primary: #ff6a00;

  --font-sans: system-ui, -apple-system, sans-serif;

  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;

  --radius-s: 6px;
  --radius-m: 12px;
  --radius-l: 20px;
}
```

---

### **2. Base**

- normalize
- reset
- box-sizing
- typography defaults

`css/base.css`:
```css
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
}
```

---

### **3. Typography**

`css/typography.css`
```css
h1, h2, h3 {
  line-height: 1.2;
  font-weight: 700;
}

p {
  margin-block: var(--space-m);
}
```

---

### **4. Layout (композиционные сущности)**

`css/layout.css`
```css
.container {
  width: min(100% - 32px, 1200px);
  margin-inline: auto;
}

.grid {
  display: grid;
  gap: var(--space-m);
}
```

---

### **5. Components**

`css/components/button.css`
```css
.button {
  padding: var(--space-s) var(--space-m);
  border-radius: var(--radius-m);
  display: inline-flex;
  align-items: center;
}

.button--primary {
  background: var(--color-primary);
  color: #fff;
}
```

---

### **6. Utilities**

`css/utils.css`
```css
.hidden { display: none !important; }
.flex { display: flex; }
.mt-s { margin-top: var(--space-s); }
.mt-m { margin-top: var(--space-m); }
```

---

### **7. Animations**

```css
.fade-in {
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

# 🧠 **3. Правила написания CSS**

## 3.1. Вложенность = 1 уровень максимум
```css
.card { ... }
.card__title { ... } /* допустимо */
.card__title span { ... } /* плохая практика */
```

## 3.2. БЭМ строго обязательный
```
.block
.block__element
.block--modifier
```

## 3.3. Не использовать `!important`
Только в утилитах и крайних случаях.

## 3.4. Использовать Custom Properties везде
Это твой SCSS-заменитель.

---

# 📱 **4. Адаптивность без препроцессоров**

## 4.1. Использовать clamp()

```css
.hero-title {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

## 4.2. Использовать fluid spacing

```css
:root {
  --space-fluid: clamp(16px, 3vw, 32px);
}
```

## 4.3. Mobile-first

```css
.card {
  padding: var(--space-s);
}

@media (min-width: 768px) {
  .card {
    padding: var(--space-m);
  }
}
```

---

# ⚙️ **5. JavaScript: архитектура уровня Senior**

## 5.1. Только ES Modules

`index.html`:
```html
<script type="module" src="./js/main.js"></script>
```

---

## 5.2. main.js

```js
import initMenu from "./modules/menu.js";
import initCart from "./modules/cart.js";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initCart();
});
```

---

## 5.3. Пример UI-модуля

`js/modules/menu.js`
```js
export default function initMenu() {
  const btn = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-menu]");

  btn.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}
```

---

## 5.4. Пример утилиты DOM

`js/utils/dom.js`
```js
export const $ = (selector, scope = document) =>
  scope.querySelector(selector);

export const $$ = (selector, scope = document) =>
  [...scope.querySelectorAll(selector)];
```

---

# 🚀 **6. Performance Best Practices (2025–2026)**

- Использовать **lazy-loading**:
```html
<img src="image.jpg" loading="lazy">
```

- Не использовать большие PNG → использовать WEBP/AVIF.
- Минимизировать перерисовку: анимировать `transform` и `opacity`.
- Выносить критический CSS в `<style>`.

---

# ♿ **7. Accessibility**

### Фокус видим всегда
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
}
```

### Правильные aria-атрибуты
```html
<button aria-expanded="false" aria-controls="menu">Menu</button>
```

### Минимальное контрастное соотношение: **4.5 : 1**

---

# 🧩 **8. Code Review Checklist (Senior-level)**

## HTML
✔ Семантика  
✔ aria-labels  
✔ Правильная структура заголовков  
✔ Нет дублирования id  

## CSS
✔ Токены используются  
✔ Нет !important  
✔ Структура ITCSS  
✔ Модульность  
✔ Адаптивность через clamp()  

## JS
✔ Модули  
✔ Нет глобальных переменных  
✔ Нет массивов с magic values  
✔ Нет лишних DOM-операций  

---

# 🏆 **9. Frontend Senior Playbook — сводка**

### Обязательные элементы:
- Design Tokens  
- ITCSS архитектура  
- Чистый HTML  
- Модульный JS  
- Адаптивный CSS с clamp  
- Доступность  
- Производительность  

---

# 🎓 **10. Заключение**

Этот документ — универсальная основа для разработки фронтенда любого уровня сложности без препроцессоров.  
Он обеспечивает стандарты, которые применяются в продуктовых командах 2025–2026 года, и гарантирует стабильный, поддерживаемый, долговечный код.

