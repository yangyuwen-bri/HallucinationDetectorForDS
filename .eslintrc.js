module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    'chrome': 'readonly',
    'browser': 'readonly'
  },
  rules: {
    // 代码质量
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    
    // 代码风格
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // 最佳实践
    'eqeqeq': 'error',
    'curly': 'error',
    'brace-style': ['error', '1tbs'],
    'camelcase': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    
    // 函数相关
    'func-style': ['error', 'expression'],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    
    // 对象和数组
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
    
    // 注释
    'spaced-comment': ['error', 'always'],
    'multiline-comment-style': ['error', 'starred-block']
  },
  overrides: [
    {
      files: ['test-*.html', '*.test.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
}; 