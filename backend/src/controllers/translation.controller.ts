import { Request, Response } from 'express';
import { translateText } from '../services/translation.service';

export const getTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, targetLang, source } = req.body;
    if (!text) {
      res.status(400).json({ message: 'Text is required' });
      return;
    }
    const translated = await translateText(text, targetLang || 'es', source || 'ui');
    res.status(200).json({ translated });
  } catch (error) {
    res.status(500).json({ message: 'Translation failed', error });
  }
};
