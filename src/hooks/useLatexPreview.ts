import { useState, useEffect, useRef } from 'react';

interface PreviewResult {
  html: string | null;
  error: string | null;
  isRendering: boolean;
}

export function useLatexPreview(latex: string, enabled: boolean): PreviewResult {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !latex) {
      setHtml(null);
      setError(null);
      return;
    }

    // Debounce rendering
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsRendering(true);
      setError(null);

      try {
        // Convert LaTeX to HTML directly (simplified preview)
        const htmlContent = latexToHtml(latex);
        setHtml(htmlContent);
        setError(null);
      } catch (err) {
        console.error('Preview error:', err);
        setError('Preview generation failed.');
        setHtml(null);
      } finally {
        setIsRendering(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [latex, enabled]);

  return { html, error, isRendering };
}

// Convert LaTeX to simplified HTML preview
function latexToHtml(latex: string): string {
  let html = latex;

  // Extract document body
  const bodyMatch = html.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (bodyMatch) {
    html = bodyMatch[1];
  }

  // Remove comments
  html = html.replace(/%.*$/gm, '');

  // Convert sections
  html = html.replace(/\\section\*?\{([^}]*)\}/g, '<h2 class="cv-section">$1</h2>');

  // Convert name/title (centered large text at top)
  html = html.replace(/\\begin\{center\}[\s\S]*?\\Huge\s*\\textbf\{([^}]*)\}[\s\S]*?\\end\{center\}/g,
    '<h1 class="cv-name">$1</h1>');

  // Handle center environment
  html = html.replace(/\\begin\{center\}/g, '<div class="cv-center">');
  html = html.replace(/\\end\{center\}/g, '</div>');

  // Convert resumeSubheading
  html = html.replace(
    /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}/g,
    '<div class="cv-entry"><div class="cv-entry-header"><span class="cv-entry-title">$1</span><span class="cv-entry-date">$2</span></div><div class="cv-entry-subheader"><span class="cv-entry-subtitle">$3</span><span class="cv-entry-location">$4</span></div></div>'
  );

  // Convert resumeProjectHeading
  html = html.replace(
    /\\resumeProjectHeading\s*\{([^}]*)\}\{([^}]*)\}/g,
    '<div class="cv-entry"><div class="cv-entry-header"><span class="cv-entry-title">$1</span><span class="cv-entry-date">$2</span></div></div>'
  );

  // Convert list environments
  html = html.replace(/\\resumeSubHeadingListStart/g, '<div class="cv-list">');
  html = html.replace(/\\resumeSubHeadingListEnd/g, '</div>');
  html = html.replace(/\\resumeItemListStart/g, '<ul class="cv-items">');
  html = html.replace(/\\resumeItemListEnd/g, '</ul>');
  html = html.replace(/\\begin\{itemize\}(\[[^\]]*\])?/g, '<ul class="cv-items">');
  html = html.replace(/\\end\{itemize\}/g, '</ul>');

  // Convert items
  html = html.replace(/\\resumeItem\{([^}]*)\}/g, '<li>$1</li>');
  html = html.replace(/\\resumeSubItem\{([^}]*)\}/g, '<li>$1</li>');
  html = html.replace(/\\item\s*/g, '<li>');

  // Text formatting
  html = html.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');
  html = html.replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>');
  html = html.replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>');
  html = html.replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>');
  html = html.replace(/\\texttt\{([^}]*)\}/g, '<code>$1</code>');
  html = html.replace(/\\small\s*/g, '');
  html = html.replace(/\\footnotesize\s*/g, '');
  html = html.replace(/\\normalsize\s*/g, '');

  // Handle links
  html = html.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');

  // Handle colors (just extract the text)
  html = html.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1');
  html = html.replace(/\\color\{[^}]*\}/g, '');

  // Handle special characters
  html = html.replace(/\\&/g, '&amp;');
  html = html.replace(/\\\$/g, '$');
  html = html.replace(/\\%/g, '%');
  html = html.replace(/\\#/g, '#');
  html = html.replace(/\\_/g, '_');
  html = html.replace(/\\{/g, '{');
  html = html.replace(/\\}/g, '}');
  html = html.replace(/---/g, '—');
  html = html.replace(/--/g, '–');
  html = html.replace(/``/g, '"');
  html = html.replace(/''/g, '"');
  html = html.replace(/`/g, "'");
  html = html.replace(/~/g, '&nbsp;');

  // Handle line breaks
  html = html.replace(/\\\\/g, '<br>');
  html = html.replace(/\\newline/g, '<br>');
  html = html.replace(/\\vspace\{[^}]*\}/g, '<div class="cv-vspace"></div>');
  html = html.replace(/\\hfill/g, '<span class="cv-hfill"></span>');

  // Remove remaining LaTeX commands
  html = html.replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})*/g, '');

  // Clean up empty tags and whitespace
  html = html.replace(/<li>\s*<\/li>/g, '');
  html = html.replace(/<ul[^>]*>\s*<\/ul>/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');

  // Wrap in container
  html = `<div class="cv-preview">${html}</div>`;

  return html;
}
