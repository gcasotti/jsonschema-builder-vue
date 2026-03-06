import type { InjectionKey, Ref } from "vue";
import { inject, isRef, provide, reactive, ref, watch } from "vue";
import { en } from "./locales/en.ts";
import type { Translation } from "./translation-keys.ts";

/**
 * Injection key for the reactive translation ref.
 * @internal
 */
export const TranslationKey: InjectionKey<Ref<Translation>> =
    Symbol("TranslationContext");

/**
 * Provide a translation context for all descendant components.
 *
 * Accepts either a plain `Translation` object or a `Ref<Translation>`.
 * When a `Ref` is provided, changing its `.value` will reactively update
 * every component that uses `useTranslation()`.
 *
 * @example
 * ```ts
 * // Static — single language
 * provideTranslation(de)
 *
 * // Reactive — switchable at runtime
 * const lang = ref(en)
 * provideTranslation(lang)
 * lang.value = de // all labels update instantly
 * ```
 */
export function provideTranslation(translation: Ref<Translation> | Translation) {
    provide(TranslationKey, isRef(translation) ? translation : ref(translation) as Ref<Translation>);
}

/**
 * Read the current translation context.
 *
 * Returns a reactive `Translation` proxy that auto-updates when the
 * provided translation ref changes. All properties reflect the current
 * locale's values, so you can use `t.someKey` both in templates and
 * in `<script setup>` without `.value`.
 *
 * Handles both plain `Translation` objects and `Ref<Translation>` as
 * injected values for backwards compatibility with existing test setups.
 */
export function useTranslation(): Translation {
    const injected = inject(TranslationKey, undefined);

    // No injection found — use English fallback
    if (!injected) {
        return reactive({ ...en }) as Translation;
    }

    // If the injected value is a Ref (from provideTranslation), watch it
    if (isRef(injected)) {
        const state = reactive({ ...injected.value }) as Translation;
        watch(injected, (newTranslation) => {
            const keys = Object.keys(newTranslation) as (keyof Translation)[];
            for (const key of keys) {
                (state as any)[key] = newTranslation[key];
            }
        }, { immediate: false });
        return state;
    }

    // Plain object (legacy test setup: provide({ [TranslationKey]: en }))
    return reactive({ ...(injected as unknown as Translation) }) as Translation;
}
