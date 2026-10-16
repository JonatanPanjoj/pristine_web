// application/usecases/ChangeLanguageUseCase.ts
import { I18nAdapter } from '../adapters/I18nAdapter';

export class ChangeLanguageUseCase {
  static execute(language: string): void {
    I18nAdapter.changeLanguage(language);
  }
}
