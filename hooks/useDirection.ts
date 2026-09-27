import { useLanguage } from '@/context/LanguageContext';

/**
 * Direction helpers for RTL-aware styling without I18nManager.forceRTL
 * (which needs a native reload and misbehaves on web).
 */
export function useDirection() {
  const { isArabic } = useLanguage();
  return {
    isRTL: isArabic,
    textAlign: (isArabic ? 'right' : 'left') as 'right' | 'left',
    row: (isArabic ? 'row-reverse' : 'row') as 'row-reverse' | 'row',
    writingDirection: (isArabic ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
  };
}
