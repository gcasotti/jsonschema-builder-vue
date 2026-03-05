import type { InjectionKey } from "vue";
import { inject, provide } from "vue";
import { en } from "./locales/en.ts";
import type { Translation } from "./translation-keys.ts";

export const TranslationKey: InjectionKey<Translation> =
    Symbol("TranslationContext");

export function provideTranslation(translation: Translation) {
    provide(TranslationKey, translation);
}

export function useTranslation(): Translation {
    return inject(TranslationKey, en);
}
