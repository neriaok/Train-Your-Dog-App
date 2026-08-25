import { useMemo } from 'react';
import { Level } from '../data';
import { useLanguage } from './LanguageContext';
import { getLocalizedLevels } from './content';

export function useLevels(): Level[] {
  const { language } = useLanguage();
  return useMemo(() => getLocalizedLevels(language), [language]);
}
