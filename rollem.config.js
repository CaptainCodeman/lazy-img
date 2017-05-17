const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const minify = require('uglify-js-harmony').minify;

export default [{
  // es5 build
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
  dest: 'dist/lazy-img.es5.js',
  sourceMap: true
}, {
  // es6 build
  entry: 'src/lazy-img.js',
  format: 'iife',
  moduleName: '',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: [
        [ "es2016" ]
      ],
      plugins: [
        "external-helpers"
      ],
      runtimeHelpers: true,
      babelrc: false,
    }),
    uglify({}, minify)
  ],
  dest: 'dist/lazy-img.es6.js',
  sourceMap: true
}, {
  // custom intersection-observer build
  entry: 'src/intersection-observer.js',
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
  dest: 'dist/intersection-observer.js',
  sourceMap: true
}];
