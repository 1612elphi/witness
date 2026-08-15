# Self-hosted fonts

Fonts bundled with `@sunbeam/beam-ui` and declared in `../fonts.css`. No CDN is
required at runtime.

| File                            | Family                    | Axes                                      | Source                                                                                                                     | Version           | License                                                              |
| ------------------------------- | ------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| `YsabeauInfantVar.woff2`        | Ysabeau Infant (normal)   | wght 1..1000                              | <https://fonts.googleapis.com/css2?family=Ysabeau+Infant:ital,wght@0,1..1000;1,1..1000&display=swap> (latin subset)        | Google Fonts v4   | OFL-1.1 ([LICENSE-ysabeau-infant.txt](./LICENSE-ysabeau-infant.txt)) |
| `YsabeauInfantVar-Italic.woff2` | Ysabeau Infant (italic)   | wght 1..1000                              | same as above (latin subset)                                                                                               | Google Fonts v4   | OFL-1.1 ([LICENSE-ysabeau-infant.txt](./LICENSE-ysabeau-infant.txt)) |
| `MonaspaceArgonVar.woff2`       | Monaspace Argon           | wght 200..800, wdth 100..125, slnt -11..0 | <https://github.com/githubnext/monaspace> (`fonts/Web Fonts/Variable Web Fonts/Monaspace Argon/Monaspace Argon Var.woff2`) | v1.400            | OFL-1.1 ([LICENSE-monaspace.txt](./LICENSE-monaspace.txt))           |
| `MaterialSymbolsOutlined.woff2` | Material Symbols Outlined | wght 100..700, FILL 0..1                  | <https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap>                  | Google Fonts v364 | Apache-2.0                                                           |

Notes:

- Ysabeau Infant files are the `latin` unicode-range subsets served by Google
  Fonts — they cover the design language's needs while staying small (~38 KB
  each).
- Material Symbols Outlined uses `font-display: block` so icon ligatures never
  render as fallback text.
