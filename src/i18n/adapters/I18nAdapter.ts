// infrastructure/i18n/I18nAdapter.ts
import i18n from '../infraestructure/i18n';

export class I18nAdapter {
  static changeLanguage(lang: string): void {
    i18n.changeLanguage(lang);
  }

  static getCurrentLanguage(): string {
    return i18n.language;
  }
}
