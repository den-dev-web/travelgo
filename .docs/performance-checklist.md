# Performance checklist

- Hero media preloaded, no lazy-loading for hero
- Non-hero images use loading="lazy" and decoding="async"
- Layout has aspect-ratio or reserved space to avoid CLS
- Animations limited to transform/opacity
- Shadows and blur used sparingly
- CSS/JS organized by ITCSS/modules for manual minification readiness
