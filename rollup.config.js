const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

export default {
  entry: 'src/lazy-img.js',
  format: 'iife',
  moduleName: '',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [
        [ "es2015", { "modules": false } ]
      ],
      plugins: [
        "external-helpers"
      ],
      runtimeHelpers: true,
      babelrc: false,
    }),
    uglify()
  ],
  dest: 'dist/lazy-img.min.js',
  sourceMap: true
};
