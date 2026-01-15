const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function inlineCss(filePath, seen = new Set()) {
  const absolute = path.resolve(filePath);
  if (seen.has(absolute)) {
    return "";
  }
  seen.add(absolute);

  let css = fs.readFileSync(absolute, "utf8");
  const importRegex = /@import\s+url\(["'](.+?)["']\);/g;

  css = css.replace(importRegex, (match, importPath) => {
    const nextPath = path.resolve(path.dirname(absolute), importPath);
    return inlineCss(nextPath, seen);
  });

  return css;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();
}

function minifyJs(js) {
  const withoutBlock = js.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = withoutBlock
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"));
  return lines.join(" ");
}

function minifyJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      minifyJsFiles(entryPath);
      return;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      const content = fs.readFileSync(entryPath, "utf8");
      fs.writeFileSync(entryPath, minifyJs(content));
    }
  });
}

function build() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  copyDir(srcDir, distDir);

  const cssPath = path.join(srcDir, "styles", "main.css");
  const bundledCss = inlineCss(cssPath);
  const minifiedCss = minifyCss(bundledCss);
  const distCssPath = path.join(distDir, "styles", "main.css");
  fs.writeFileSync(distCssPath, minifiedCss);

  const distJsDir = path.join(distDir, "js");
  minifyJsFiles(distJsDir);

  console.log("Build complete: dist/");
}

build();
