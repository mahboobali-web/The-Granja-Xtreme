import fs from 'fs';

const data = JSON.parse(fs.readFileSync('i18n-scan-output.json', 'utf8'));
const enTranslations = {};

data.forEach(fileObj => {
  fileObj.strings.forEach(s => {
    // Generate a simple key based on the text (alphanumeric, camelCase or snake_case)
    let key = s.text
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    // Fallback key if empty
    if (!key) key = 'empty_string_key_' + Math.floor(Math.random() * 1000);
    
    // Prevent overriding with different cases if collision
    let finalKey = key;
    let counter = 1;
    while (enTranslations[finalKey] && enTranslations[finalKey] !== s.text) {
      finalKey = `${key}_${counter}`;
      counter++;
    }
    
    enTranslations[finalKey] = s.text;
  });
});

fs.writeFileSync('public/locales/en/translation.json', JSON.stringify(enTranslations, null, 2));
console.log(`Generated ${Object.keys(enTranslations).length} keys in en/translation.json`);
