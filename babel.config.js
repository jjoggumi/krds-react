module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: 'entry',
      polyfills: ['es6.promise', 'es6.symbol']
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-logical-assignment-operators'
  ]
};
