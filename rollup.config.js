import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: './miniprogram/pages/index/index.ts',
    treeshake: true,
    output: {
      format: 'esm',
      file: './miniprogram/pages/index/index.js'
    },
    plugins: [
      resolve({ extensions: ['.ts', '.js'] }),
      commonjs(),
      terser(),
      sucrase({
        transforms: ['typescript']
      })
    ]
  }
]