import fs from 'fs';
import { globSync } from 'glob';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

// Find all TS/TSX/JS/JSX files in src
const files = globSync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['src/**/*.test.*', 'src/**/*.d.ts', 'src/assets/**']
});

const output = [];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
    return;
  }

  const strings = [];

  traverse(ast, {
    JSXText(path) {
      const text = path.node.value.replace(/\s+/g, ' ').trim();
      if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
        // Determine category based on parent
        let category = 'UI Text';
        let risk = 'LOW';
        
        const parentName = path.parent.name?.name || path.parent.name;
        
        if (typeof parentName === 'string') {
          const lowerName = parentName.toLowerCase();
          if (lowerName.includes('button')) {
            category = 'Button';
            risk = 'HIGH';
          } else if (/^h[1-6]$/.test(lowerName)) {
            category = 'Heading';
            risk = 'LOW';
          } else if (lowerName === 'label') {
            category = 'Label';
            risk = 'MEDIUM';
          } else if (lowerName === 'th' || lowerName.includes('table')) {
            category = 'Table Column';
            risk = 'HIGH';
          } else if (lowerName === 'span' || lowerName === 'div' || lowerName === 'p') {
            category = 'Static Text';
            risk = 'MEDIUM';
          }
        }
        
        strings.push({
          text,
          category,
          risk
        });
      }
    },
    StringLiteral(path) {
      // Find placeholders, alerts, generic UI strings in attributes
      if (path.parent.type === 'JSXAttribute') {
        const attrName = path.parent.name.name;
        if (attrName === 'placeholder' || attrName === 'title' || attrName === 'alt') {
          strings.push({
            text: path.node.value,
            category: 'Input Placeholder/Attribute',
            risk: 'LOW'
          });
        }
      }
    }
  });

  if (strings.length > 0) {
    // deduplicate inside a file
    const uniqueStrings = [];
    const seen = new Set();
    strings.forEach(s => {
      if (!seen.has(s.text)) {
        seen.add(s.text);
        uniqueStrings.push(s);
      }
    });

    output.push({
      file,
      strings: uniqueStrings
    });
  }
});

fs.writeFileSync('i18n-scan-output.json', JSON.stringify(output, null, 2));
console.log(`Extraction complete. Found ${output.length} files with translatable strings.`);
