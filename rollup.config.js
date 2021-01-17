import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: './miniprogram/pages/index/index.ts',
    treeshake: true,
    output: {
      format: 'esm',
      file: './miniprogram/pages/index/index.js'
    },
    plugins: [
      resolve(),
      terser(),
      sucrase({
        transforms: ['typescript']
      })
    ]
  }
]