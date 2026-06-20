const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

function replaceAll(oldText, newText, label) {
  const count = html.split(oldText).length - 1;
  if (count === 0) {
    throw new Error(`Expected text not found (${label}): ${oldText.slice(0, 80)}...`);
  }
  html = html.split(oldText).join(newText);
  console.log(`${label}: ${count} replacement(s)`);
}

replaceAll(
  '{ id: 5, name: "Urology", icon: "kidneys", color: "#F4A261", subcategories: [',
  '{ id: 5, name: "Urology/Nephrology", icon: "kidneys", color: "#F4A261", subcategories: [',
  "category name"
);
replaceAll(
  '{ id: "nephrology", name: "Nephrology / CKD" },',
  '{ id: "nephrology", name: "CKD / Electrolytes" },',
  "subcategory name"
);
replaceAll(
  "kidneys: 1.5,      // Urology",
  "kidneys: 1.5,      // Urology/Nephrology",
  "icon comment"
);
replaceAll(
  'cat.name === "Musculoskeletal" || cat.name === "Gastroenterology" || cat.name === "Cardiovascular" || cat.name === "Rheumatology"',
  'cat.name === "Musculoskeletal" || cat.name === "Gastroenterology" || cat.name === "Cardiovascular" || cat.name === "Rheumatology" || cat.name === "Urology/Nephrology" || cat.name === "Infectious Disease"',
  "mobile wheel font sizing"
);

html = html.replace(
  /categoryName: \{\r?\n      fontSize: effectiveMobile \? "12px" : isDesktopHome \? "clamp\(11px, 1\.8vh, 18px\)" : "13px",\r?\n      fontWeight: "500",\r?\n      color: "#334155",\r?\n      minHeight: effectiveMobile \? "24px" : isDesktopHome \? "clamp\(18px, 2\.5vh, 32px\)" : "28px",\r?\n      display: "flex",\r?\n      alignItems: "center",\r?\n      justifyContent: "center",\r?\n      lineHeight: "1\.2"\r?\n    \},/,
  `categoryName: {
      fontSize: effectiveMobile ? "12px" : isDesktopHome ? "clamp(11px, 1.8vh, 18px)" : "13px",
      fontWeight: "500",
      color: "#334155",
      minHeight: effectiveMobile ? "24px" : isDesktopHome ? "clamp(18px, 2.5vh, 32px)" : "28px",
      width: "100%",
      padding: "0 2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: "1.2",
      textAlign: "center",
      overflowWrap: "break-word",
      wordBreak: "break-word"
    },`
);

if (!html.includes("Urology/Nephrology")) {
  throw new Error("Category rename did not apply");
}
if (!html.includes("CKD / Electrolytes")) {
  throw new Error("Subcategory rename did not apply");
}
if (!html.includes('overflowWrap: "break-word"')) {
  throw new Error("categoryName CSS update did not apply");
}

fs.writeFileSync(indexPath, html, "utf8");
console.log("Done: Urology/Nephrology category rename complete.");
