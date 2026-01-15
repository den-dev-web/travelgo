# Project conventions

## Pages
- src/index.html
- src/tour.html

## CSS architecture
- ITCSS layers (settings, generic, elements, objects, components, utilities)
- BEM naming for blocks/elements/modifiers
- Keep nesting to one level max

## JavaScript standards
- ES modules only
- Feature-based modules in src/js/modules
- Use data attributes as component APIs
- Prefer event delegation for lists and dynamic UI
- Use pointer events where appropriate

## UI principles
- Mobile-first
- 1-2 media queries per page, use fluid/clamp for the rest
- Animations only on transform/opacity
- Respect prefers-reduced-motion
