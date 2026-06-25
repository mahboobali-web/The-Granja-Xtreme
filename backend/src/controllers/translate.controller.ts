import { Request, Response } from 'express';
import { translate } from '@vitalets/google-translate-api';

export const translateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLang = 'es' } = req.body;
    
    if (!text) {
      res.status(400).json({ message: 'Text is required for translation.' });
      return;
    }

    // Call the translation API
    const result = await translate(text, { to: targetLang });
    
    res.status(200).json({ translatedText: result.text });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Failed to translate text.', error: (error as Error).message });
  }
};
