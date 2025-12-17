// obfuscate-lore.cjs
// Overwrites all .md files in static/content/ with obfuscated versions (randomized letters, preserves formatting)

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'static', 'content');

function obfuscateText(text) {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char === char.toUpperCase();
    const code = Math.floor(Math.random() * 26) + 97;
    const letter = String.fromCharCode(code);
    return isUpper ? letter.toUpperCase() : letter;
  });
}

function obfuscateMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith('.md')) {
      const filePath = path.join(dir, file);
      const original = fs.readFileSync(filePath, 'utf8');
      const obfuscated = obfuscateText(original);
      fs.writeFileSync(filePath, obfuscated, 'utf8');
      console.log(`Obfuscated: ${file}`);
    }
  });
}

obfuscateMarkdownFiles(CONTENT_DIR);