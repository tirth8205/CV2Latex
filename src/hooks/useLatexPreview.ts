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

    debounceRef.current = setTimeout(async () => {
      setIsRendering(true);
      setError(null);

      try {
        // Dynamic import to avoid loading latex.js until needed
        const { parse, HtmlGenerator } = await import('latex.js');

        const generator = new HtmlGenerator({ hyphenate: false });

        // latex.js may not support all our LaTeX commands, so we need to simplify
        const simplifiedLatex = simplifyLatex(latex);

        const doc = parse(simplifiedLatex, { generator });
        const htmlDoc = doc.htmlDocument();

        // Extract just the body content
        const bodyMatch = htmlDoc.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : htmlDoc;

        setHtml(bodyContent);
        setError(null);
      } catch (err) {
        console.error('LaTeX preview error:', err);
        setError(
          'Preview unavailable. Some LaTeX features are not supported in the browser preview. ' +
          'Download the .tex file and compile it locally for the full result.'
        );
        setHtml(null);
      } finally {
        setIsRendering(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [latex, enabled]);

  return { html, error, isRendering };
}

// Simplify LaTeX to what latex.js can handle
function simplifyLatex(latex: string): string {
  let result = latex;

  // Remove unsupported packages
  const unsupportedPackages = [
    'titlesec', 'fancyhdr', 'ragged2e', 'glyphtounicode',
    'marvosym', 'palatino', 'helvet', 'fontenc'
  ];
  unsupportedPackages.forEach(pkg => {
    result = result.replace(new RegExp(`\\\\usepackage(\\[[^\\]]*\\])?\\{${pkg}\\}`, 'g'), '');
  });

  // Remove unsupported commands
  result = result.replace(/\\input\{glyphtounicode\}/g, '');
  result = result.replace(/\\pdfgentounicode=1/g, '');
  result = result.replace(/\\pagestyle\{[^}]*\}/g, '');
  result = result.replace(/\\fancyhf\{[^}]*\}/g, '');
  result = result.replace(/\\renewcommand\{\\headrulewidth\}[^}]*\}/g, '');
  result = result.replace(/\\renewcommand\{\\footrulewidth\}[^}]*\}/g, '');
  result = result.replace(/\\titleformat[^{]*\{[^}]*\}[^[]*\[[^\]]*\]/g, '');
  result = result.replace(/\\titleformat\{\\section\}[\s\S]*?\[\\vspace\{-5pt\}\]/g, '');
  result = result.replace(/\\renewcommand\{\\familydefault\}[^}]*\}/g, '');

  // Remove margin adjustments that might cause issues
  result = result.replace(/\\addtolength\{[^}]*\}\{[^}]*\}/g, '');

  // Simplify custom commands - convert to basic LaTeX
  result = result.replace(/\\resumeSubHeadingListStart/g, '\\begin{itemize}');
  result = result.replace(/\\resumeSubHeadingListEnd/g, '\\end{itemize}');
  result = result.replace(/\\resumeItemListStart/g, '\\begin{itemize}');
  result = result.replace(/\\resumeItemListEnd/g, '\\end{itemize}');
  result = result.replace(/\\resumeItem\{([^}]*)\}/g, '\\item $1');
  result = result.replace(/\\resumeSubItem\{([^}]*)\}/g, '\\item $1');

  // Convert resumeSubheading to simpler format
  result = result.replace(
    /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}/g,
    '\\item \\textbf{$1} \\hfill $2 \\\\ \\textit{$3} \\hfill $4'
  );

  // Convert resumeProjectHeading
  result = result.replace(
    /\\resumeProjectHeading\s*\{([^}]*)\}\{([^}]*)\}/g,
    '\\item $1 $2'
  );

  // Remove custom command definitions (newcommand blocks)
  result = result.replace(/\\newcommand\{[^}]*\}(\[[^\]]*\])?\{[\s\S]*?\}(\{[\s\S]*?\})?/g, '');
  result = result.replace(/\\renewcommand[^{]*\{[^}]*\}/g, '');

  // Handle colors
  result = result.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1');
  result = result.replace(/\\color\{[^}]*\}/g, '');

  // Replace tabular* with tabular
  result = result.replace(/\\begin\{tabular\*\}[^{]*\{[^}]*\}/g, '\\begin{tabular}{ll}');
  result = result.replace(/\\end\{tabular\*\}/g, '\\end{tabular}');

  // Remove extracolsep
  result = result.replace(/@\{\\extracolsep\{[^}]*\}\}/g, '');

  // Clean up multiple empty lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}
