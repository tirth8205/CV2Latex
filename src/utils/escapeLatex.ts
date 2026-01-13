/**
 * Escapes special LaTeX characters in text.
 * Order matters: backslash must be escaped first to avoid double-escaping.
 */
export function escapeLatex(text: string): string {
  if (!text) return '';

  return text
    // First escape backslashes (must be first!)
    .replace(/\\/g, '\\textbackslash{}')
    // Then escape other special characters
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Escapes LaTeX special characters but preserves markdown-style formatting
 * that will be converted to LaTeX commands later.
 */
export function escapeLatexPreserveFormatting(text: string): string {
  if (!text) return '';

  // Store markdown formatting temporarily with Unicode placeholders that won't be escaped
  const replacements: { placeholder: string; latex: string }[] = [];
  let processed = text;
  let counter = 0;

  // Use Unicode private use area characters as placeholders (won't be escaped)
  const getPlaceholder = () => `\uE000${counter++}\uE001`;

  // Preserve **bold** text (handle both **text** and *text** malformed cases)
  processed = processed.replace(/\*{1,2}([^*]+)\*{1,2}/g, (_match, content) => {
    const placeholder = getPlaceholder();
    replacements.push({ placeholder, latex: `\\textbf{${escapeLatex(content.trim())}}` });
    return placeholder;
  });

  // Preserve [text](url) links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const placeholder = getPlaceholder();
    replacements.push({ placeholder, latex: `\\href{${url}}{\\underline{${escapeLatex(linkText)}}}` });
    return placeholder;
  });

  // Escape LaTeX special characters
  processed = escapeLatex(processed);

  // Restore formatting
  for (const { placeholder, latex } of replacements) {
    processed = processed.replace(placeholder, latex);
  }

  return processed;
}

/**
 * Strips markdown formatting from text (for section titles etc.)
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';

  return text
    // Remove bold markers
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    // Remove italic markers
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove link syntax, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * Formats a URL for LaTeX with underlined text
 */
export function formatLink(url: string, displayText?: string): string {
  const text = displayText || url.replace(/^https?:\/\/(www\.)?/, '');
  return `\\href{${url}}{\\underline{${escapeLatex(text)}}}`;
}

/**
 * Formats an email address for LaTeX
 */
export function formatEmail(email: string): string {
  return `\\href{mailto:${email}}{\\underline{${escapeLatex(email)}}}`;
}

/**
 * Formats a phone number for LaTeX
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `\\href{tel:${cleanPhone}}{\\underline{${escapeLatex(phone)}}}`;
}
