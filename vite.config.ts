import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Consume Beam from its vendored source (vendor/beam-ui/src), the way Beam's
// own reference app does. Its source uses plain bare specifiers, so no JSR
// npm:-specifier shims are needed. `styled-system` is Panda's generated output.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
      '@sunbeam/beam-ui': fileURLToPath(new URL('./vendor/beam-ui/src', import.meta.url)),
    },
  },
})
