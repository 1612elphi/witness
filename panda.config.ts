import { defineConfig } from "@pandacss/dev";
import { beamPreset } from "./vendor/beam-ui/src/preset.ts";

// Panda must scan the vendored Beam source so it extracts the css() calls
// inside Beam components, alongside this app's own usage.
export default defineConfig({
  preflight: true,
  presets: [beamPreset],
  jsxFramework: "react",
  include: [
    "./src/**/*.{ts,tsx}",
    "./vendor/beam-ui/src/**/*.{ts,tsx}",
  ],
  exclude: [],
  outdir: "styled-system",
});
