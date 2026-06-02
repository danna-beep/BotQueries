export default {
  contextSeparator: '_',
  createOldCatalogs: false,
  defaultNamespace: 'translation',
  defaultValue: '',
  indentation: 2,
  keepRemoved: true,
  keySeparator: false,
  lexers: {
    js: [
      {
        lexer: 'JavascriptLexer',
        functions: ['t'],
        namespaceFunctions: ['useTranslation'],
      },
    ],
    ts: [
      {
        lexer: 'JavascriptLexer',
        attr: 'i18nKey',
        functions: ['t'],
        namespaceFunctions: ['useTranslation'],
        componentFunctions: ['Trans'],
      },
    ],
    jsx: [
      {
        lexer: 'JsxLexer',
        attr: 'i18nKey',
        functions: ['t'],
        namespaceFunctions: ['useTranslation'],
        componentFunctions: ['Trans'],
      },
    ],
    tsx: [
      {
        lexer: 'JsxLexer',
        attr: 'i18nKey',
        functions: ['t'],
        namespaceFunctions: ['useTranslation'],
        componentFunctions: ['Trans'],
      },
    ],
    default: ['JavascriptLexer'],
  },
  lineEnding: 'auto',
  locales: ['en', 'es'],
  namespaceSeparator: false,
  output: './src/i18n/locales/$LOCALE/$NAMESPACE.json',
  pluralSeparator: '_',
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/node_modules/**',
    '!src/i18n/**',
  ],
  sort: true,
  verbose: true,
  failOnWarnings: false,
  failOnUpdate: false,
  customValueTemplate: null,
  resetDefaultValueLocale: null,

  i18nextOptions: {
    pluralSeparator: '_',
    contextSeparator: '_',
    contextDefaultValues: [],
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  yamlOptions: null,
}
