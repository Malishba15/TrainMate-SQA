const fs = require("fs");
const path = require("path");

const base = "__tests__";

const rules = {
  unit: ["Controller", "Service", "util", "utils"],
  integration: ["integration", "routes"],
  api: ["api"],
  e2e: ["e2e"]
};

function getCategory(file) {
  for (const [folder, keywords] of Object.entries(rules)) {
    if (keywords.some(k => file.toLowerCase().includes(k.toLowerCase()))) {
      return folder;
    }
  }
  return "unit"; // default fallback
}

fs.readdirSync(base).forEach(file => {
  const fullPath = path.join(base, file);

  if (!file.endsWith(".test.js")) return;

  const category = getCategory(file);
  const targetDir = path.join(base, category);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const newPath = path.join(targetDir, file);
  fs.renameSync(fullPath, newPath);

  console.log(`Moved ${file} → ${category}/`);
});