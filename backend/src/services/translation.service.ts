import { Translation } from '../models/translation.model';
import { translate } from '@vitalets/google-translate-api';

export const translateText = async (text: string, targetLang: string = 'es', source: 'ui' | 'dynamic' = 'dynamic'): Promise<string> => {
  if (!text) return text;
  
  // 1. Check cache first
  const cacheKey = typeof text === 'string' ? text.trim() : text;
  
  try {
    const existing = await Translation.findOne({ en: cacheKey });
    if (existing && existing.es) {
      return existing.es;
    }

    // 2. Not in cache -> Call vitalets free API
    const result = await translate(cacheKey, { to: targetLang });
    const translatedText = result.text;

    // 3. Save back to Cache
    const newTranslation = new Translation({
      key: cacheKey.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50) + '_' + Date.now(),
      en: cacheKey,
      es: translatedText,
      source
    });
    
    await newTranslation.save();

    return translatedText;
  } catch (error) {
    console.error('Translation Service Error:', error);
    return text; // Fallback to original
  }
};
