const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const oldText =
  '/* @__PURE__ */ React.createElement("div", { style: styles.categoryName }, cat.name)),';
const newText =
  '/* @__PURE__ */ React.createElement("div", { style: { ...styles.categoryName, ...(isDesktopHome && cat.name === "Urology/Nephrology" ? { fontSize: "clamp(9px, 1.45vh, 14px)", whiteSpace: "nowrap" } : {}) } }, cat.name)),';

if (!html.includes(oldText)) {
  throw new Error("Expected desktop category name render not found");
}
if (html.includes(newText)) {
  throw new Error("Desktop Urology/Nephrology font override already applied");
}

html = html.replace(oldText, newText);
fs.writeFileSync(indexPath, html, "utf8");
console.log("Applied desktop-only smaller font for Urology/Nephrology category card.");
