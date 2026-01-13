import Prism from 'prismjs';

// Define LaTeX language for Prism.js
Prism.languages.latex = {
  comment: /%.*$/m,
  // Commands like \textbf, \section, etc.
  command: {
    pattern: /\\(?:[a-zA-Z@]+|\S)/,
    alias: 'keyword',
  },
  // Arguments in braces
  parameter: {
    pattern: /\{[^{}]*\}/,
    inside: {
      punctuation: /[{}]/,
      // Nested commands
      command: {
        pattern: /\\(?:[a-zA-Z@]+|\S)/,
        alias: 'keyword',
      },
    },
  },
  // Optional arguments in brackets
  optional: {
    pattern: /\[[^\]]*\]/,
    inside: {
      punctuation: /[\[\]]/,
    },
  },
  // Math mode
  math: {
    pattern: /\$[^$]*\$/,
    alias: 'string',
  },
  // Special punctuation
  punctuation: /[{}[\]&\\]/,
};

export default Prism;
