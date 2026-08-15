# @sunbeam/beam-ui

Sunbeam Studios design system. React 19 components, hooks, form helpers, and an
i18n module — all themed via a Panda CSS preset (`beamPreset`).

## Install

```sh
deno add jsr:@sunbeam/beam-ui
# or
npx jsr add @sunbeam/beam-ui
# or
bunx jsr add @sunbeam/beam-ui
```

Peer dependencies (you supply these):

- `react` ^19
- `react-dom` ^19
- `@tanstack/react-router` ^1
- `@ark-ui/react` ^4
- `@pandacss/dev` ^1.9
- `zustand` ^5

## Quick start

Wire the Panda preset into your `panda.config.ts`:

```ts
import { defineConfig } from "@pandacss/dev";
import { beamPreset } from "@sunbeam/beam-ui/preset";

export default defineConfig({
  preflight: true,
  presets: [beamPreset],
  include: ["./src/**/*.{ts,tsx}", "./node_modules/@sunbeam/beam-ui/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
```

Then drop a component in:

```tsx
import { Button, Card, useTheme } from "@sunbeam/beam-ui";

export function Hero() {
  const { theme, toggle } = useTheme();
  return (
    <Card>
      <h1>Welcome to Sunbeam</h1>
      <Button variant="primary" onClick={toggle}>
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </Button>
    </Card>
  );
}
```

## Entry points

| Import path                  | Module                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| `@sunbeam/beam-ui`           | All UI components, layout shell, hooks, stores, navigation/status data |
| `@sunbeam/beam-ui/preset`    | The `beamPreset` Panda CSS preset (tokens, semantic tokens, text styles) |
| `@sunbeam/beam-ui/form`      | Form wrapper around `react-hook-form` + zod (`Form`, `FormField`, re-exports) |
| `@sunbeam/beam-ui/i18n`      | `I18nProvider` + `useTranslation` hook for locale-scoped messages     |

## Theming

Color scheme is controlled by `data-theme` on `<html>`. The exported `useTheme`
zustand store reads/writes the active theme to a cookie scoped to the apex
domain (so `*.sunbeam.pt` shares state) with `localStorage` and
`prefers-color-scheme` fallbacks.

```tsx
import { useTheme } from "@sunbeam/beam-ui";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme}</button>;
}
```

## Forms

```tsx
import { Form, FormField, z } from "@sunbeam/beam-ui/form";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function SignIn() {
  return (
    <Form schema={schema} onSubmit={(values) => console.log(values)}>
      {(methods) => (
        <>
          <FormField name="email" label="Email" methods={methods} />
          <FormField name="password" label="Password" methods={methods} />
          <button type="submit">Sign in</button>
        </>
      )}
    </Form>
  );
}
```

## i18n

```tsx
import { I18nProvider, useTranslation } from "@sunbeam/beam-ui/i18n";

const config = {
  defaultLocale: "en",
  locales: {
    en: { greeting: "Hello, {name}!" },
    pt: { greeting: "Olá, {name}!" },
  },
};

function Greeting() {
  const { t } = useTranslation();
  return <p>{t("greeting", { name: "Sienna" })}</p>;
}

export function App() {
  return (
    <I18nProvider config={config} locale="en">
      <Greeting />
    </I18nProvider>
  );
}
```

## License

MIT
