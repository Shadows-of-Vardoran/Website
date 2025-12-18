// obfuscate-lore.cjs
// Overwrites all .md files in static/content/ prefixed with "lore-" with obfuscated versions (randomized letters, preserves formatting)
// Leaves [!TEXT] patterns untouched

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'static', 'content');

// Obfuscate all letters except those inside [!TEXT] patterns
function obfuscateText(text) {
  // Collect all ignore patterns in the order they appear in the text
  const ignorePatterns = [
    /\[\![^\]]*\]/g, // [!TEXT]
    /!\[[^\]]*\]\([^\)]*\)/g, // ![alt](src)
    /<img\b[^>]*?>/gi // <img ... />
  ];
  const ignored = [];
  let i = 0;

  // Replace all ignore patterns with placeholders in order of appearance
  let combinedPattern = new RegExp(
    ignorePatterns.map(r => r.source).join('|'),
    'g'
  );
  text = text.replace(combinedPattern, (match) => {
    ignored.push(match);
    return `<<OBFUSCATE_IGNORE_${i++}>>`;
  });

  // Obfuscate only outside placeholders
  text = text.split(/(<<OBFUSCATE_IGNORE_\d+>>)/g)
    .map(segment => {
      if (/^<<OBFUSCATE_IGNORE_\d+>>$/.test(segment)) {
        return segment;
      }
      return segment.replace(/[a-zA-Z]/g, (char) => {
        const isUpper = char === char.toUpperCase();
        const code = Math.floor(Math.random() * 26) + 97;
        const letter = String.fromCharCode(code);
        return isUpper ? letter.toUpperCase() : letter;
      });
    })
    .join('');

  // Restore ignored patterns
  text = text.replace(/<<OBFUSCATE_IGNORE_(\d+)>>/g, (_, idx) => ignored[idx]);

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