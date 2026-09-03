import { defineConfig } from 'tsup'

/** Package name used by the browser module loader. */
const ID = 'dsh-math-thinking-teacher'

const nodeExternal = [
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-agent-presets',
  '@deepseek-ai/dsh-host-webserver',
  '@deepseek-ai/dsh-system-prompt',
  '@deepseek-ai/schemastery',
]

const clientExternal = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-runtime/client',
]

export default defineConfig([
  {
    entry: { index: 'src/index.ts', preset: 'src/preset.ts' },
    format: ['esm'],
    platform: 'node',
    target: 'node18',
    dts: true,
    sourcemap: true,
    clean: true,
    external: nodeExternal,
    outDir: 'lib',
  },
  {
    entry: { 'client/index': 'src/client/index.ts' },
    format: ['cjs'],
    platform: 'browser',
    target: 'es2022',
    outExtension: () => ({ js: '.js' }),
    dts: false,
    sourcemap: true,
    clean: false,
    external: clientExternal,
    outDir: 'lib',
    banner: {
      js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {\n`
        + 'var module = { exports: {} }; var exports = module.exports;',
    },
    footer: { js: 'return module.exports; } });' },
  },
  {
    entry: { 'client/index': 'src/client/index.ts' },
    format: ['esm'],
    dts: { only: true },
    clean: false,
    external: clientExternal,
    outDir: 'lib',
  },
])
