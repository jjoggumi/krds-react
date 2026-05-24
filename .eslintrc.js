// .eslintrc.js
module.exports = {
  // 현재 eslintrc 파일을 기준으로 ESLint 규칙을 적용
  root: true,

  // 추가적인 규칙들을 적용
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    // 'prettier',
    // 'plugin:prettier/recommended',
    '@vue/typescript'
  ],

  // 코드 정리 플러그인 추가
  plugins: ['prettier'],

  // 사용자 편의 규칙 추가
  rules: {
    'prettier/prettier': [
      'off',
    // 아래 규칙들은 개인 선호에 따라 prettier 문법 적용
    // https://prettier.io/docs/en/options.html
      {
        singleQuote: true,
        semi: false,
      // useTabs: true,
      // tabWidth: 2,
      // trailingComma: 'all',
      // printWidth: 100,
      // bracketSpacing: false,
      // arrowParens: 'avoid',
      },
    ],
    // "parserOptions": {
    //   "parser": "babel-eslint"
    // },
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  // 글로벌 변수/함수 lint 제외
  globals: {
    'process': false,
    '$': false,
    'moment': false,
    'require': false,
    'dtrum': false,
    'module': false,
    '__dirname': false,
    'exports': false,
    '_':true
  },

  // global object lint 인식
  env: {
    "browser": true,
    "jest": true
  },
  
};
