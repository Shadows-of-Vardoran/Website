// obfuscate-lore.cjs
// Overwrites all .md files in static/content/ prefixed with "lore-" with obfuscated versions (randomized letters, preserves formatting)
// Leaves [!TEXT] patterns untouched

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'static', 'content');

// Obfuscate all letters except those inside [!TEXT] patterns
function obfuscateText(text) {
  // Find all [!TEXT] patterns and replace with placeholders
  const ignorePattern = /\[\![^\]]*\]/g;
  const ignored = [];
  let i = 0;
  text = text.replace(ignorePattern, (match) => {
    ignored.push(match);
    return `__OBFUSCATE_IGNORE_${i++}__`;
  });

  // Obfuscate the rest
  text = text.replace(/[a-zA-Z]/g, (char) => {
    const isUpper = char === char.toUpperCase();
    const code = Math.floor(Math.random() * 26) + 97;
    const letter = String.fromCharCode(code);
    return isUpper ? letter.toUpperCase() : letter;
  });

  // Restore ignored patterns
  text = text.replace(/__OBFUSCATE_IGNORE_(\d+)__/g, (_, idx) => ignored[idx]);

  return text;
}

function obfuscateMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.startsWith('lore-') && file.endsWith('.md')) {
      const filePath = path.join(dir, file);
      const original = fs.readFileSync(filePath, 'utf8');
      const obfuscated = obfuscateText(original);
      fs.writeFileSync(filePath, obfuscated, 'utf8');
      console.log(`Obfuscated: ${file}`);
    }
  });
}

obfuscateMarkdownFiles(CONTENT_DIR);