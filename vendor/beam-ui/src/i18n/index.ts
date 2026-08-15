/**
 * Lightweight i18n context for Sunbeam apps.
 *
 * Provides {@link I18nProvider} (a context provider that owns the active locale +
 * dictionary) and {@link useTranslation} (a hook returning `t()` plus the
 * locale setter). Pluralization is handled via `.one` / `.other` keys.
 *
 * @example
 * ```tsx
 * import { I18nProvider, useTranslation } from "@sunbeam/beam-ui/i18n";
 *
 * const config = {
 *   defaultLocale: "en",
 *   locales: {
 *     en: { greeting: "Hello, {name}!", "items.one": "1 item", "items.other": "{count} items" },
 *     pt: { greeting: "Olá, {name}!", "items.one": "1 item", "items.other": "{count} itens" },
 *   },
 * };
 *
 * function Greeting() {
 *   const { t } = useTranslation();
 *   return <p>{t("greeting", { name: "Sienna" })}</p>;
 * }
 *
 * export function App() {
 *   return (
 *     <I18nProvider config={config} locale="en">
 *       <Greeting />
 *     </I18nProvider>
 *   );
 * }
 * ```
 *
 * @module
 */
import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * Configuration object for the i18n system.
 *
 * Maps locales to message catalogs with optional pluralization support.
 */
export interface I18nConfig {
  /** Fallback locale when requested locale has missing messages. */
  defaultLocale: string;
  /** Dictionary of locales, each containing message key-value pairs. For pluralization, use `.one` and `.other` suffixes (e.g., `"items.one"`, `"items.other"`). */
  locales: Record<string, Record<string, string>>;
}

/**
 * Value provided by {@link I18nProvider} context.
 *
 * Contains the translation function and locale management.
 */
interface I18nContextValue {
  /** Translate a message key with optional variable interpolation. Supports `{{varName}}` placeholders and `.one`/`.other` pluralization. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Current active locale. */
  locale: string;
  /** Change the active locale and notify all consumers. */
  setLocale: (locale: string) => void;
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

const I18nContext = createContext<I18nContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

/** Props for {@link I18nProvider}. */
interface I18nProviderProps {
  /** i18n configuration with locale dictionaries and default locale. */
  config: I18nConfig;
  /** Initial active locale. */
  locale: string;
  /** App content to wrap. */
  children: ReactNode;
}

/**
 * Provider component for internationalization (i18n) support.
 *
 * Wraps your app to enable translation via {@link useTranslation} hook.
 * Handles locale switching and message lookups with fallback to default locale.
 *
 * @example
 * ```tsx
 * const config: I18nConfig = {
 *   defaultLocale: "en",
 *   locales: {
 *     en: {
 *       "hello": "Hello, {{name}}!",
 *       "items.one": "1 item",
 *       "items.other": "{{count}} items",
 *     },
 *     es: {
 *       "hello": "Hola, {{name}}!",
 *       "items.one": "1 elemento",
 *       "items.other": "{{count}} elementos",
 *     },
 *   },
 * };
 *
 * <I18nProvider config={config} locale="en">
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider(
  { config, locale: initialLocale, children }: I18nProviderProps,
): ReactNode {
  const [locale, setLocale] = useState(initialLocale);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const messages = config.locales[locale] ??
        config.locales[config.defaultLocale] ?? {};
      const fallback = config.locales[config.defaultLocale] ?? {};

      // Handle pluralization: if `count` is provided, try `.one` / `.other` suffixes
      let resolved: string | undefined;
      if (vars && "count" in vars) {
        const count = Number(vars.count);
        const suffix = count === 1 ? ".one" : ".other";
        resolved = messages[key + suffix] ?? fallback[key + suffix];
      }

      // Fall back to base key
      if (!resolved) {
        resolved = messages[key] ?? fallback[key] ?? key;
      }

      // Interpolate {{var}} placeholders
      if (vars) {
        resolved = resolved.replace(/\{\{(\w+)\}\}/g, (_, name) => {
          return vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`;
        });
      }

      return resolved;
    },
    [locale, config],
  );

  const value: I18nContextValue = { t, locale, setLocale };

  return createElement(I18nContext.Provider, { value }, children);
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Hook to access translation function and locale management.
 *
 * Must be used within an {@link I18nProvider} context.
 * Throws an error if context is not available.
 *
 * @example
 * ```tsx
 * function Greeting() {
 *   const { t, locale, setLocale } = useTranslation();
 *
 *   return (
 *     <div>
 *       <p>{t("hello", { name: "World" })}</p>
 *       <p>Current locale: {locale}</p>
 *       <button onClick={() => setLocale("es")}>Español</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
