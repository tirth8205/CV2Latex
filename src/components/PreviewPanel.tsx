import { useLatexPreview } from '../hooks/useLatexPreview';

interface PreviewPanelProps {
  latex: string;
}

export function PreviewPanel({ latex }: PreviewPanelProps) {
  const { html, error, isRendering } = useLatexPreview(latex, true);

  if (!latex) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">Convert your CV to see a preview</p>
        </div>
      </div>
    );
  }

  if (isRendering) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rendering preview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 mb-3 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            {error}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The Code tab shows the complete LaTeX output.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div
        className="preview-content p-8 max-w-[8.5in] mx-auto"
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
      <style>{`
        .preview-content {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
        }

        .cv-preview {
          padding: 0.5in 0;
        }

        .cv-name {
          font-size: 24pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 8px;
        }

        .cv-center {
          text-align: center;
          margin-bottom: 12px;
        }

        .cv-section {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .cv-list {
          margin: 0;
          padding: 0;
        }

        .cv-entry {
          margin-bottom: 8px;
        }

        .cv-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cv-entry-title {
          font-weight: bold;
        }

        .cv-entry-date {
          font-size: 10pt;
          color: #333;
        }

        .cv-entry-subheader {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          font-style: italic;
          font-size: 10pt;
        }

        .cv-entry-subtitle {
          font-style: italic;
        }

        .cv-entry-location {
          color: #333;
        }

        .cv-items {
          margin: 4px 0 8px 20px;
          padding: 0;
          list-style-type: disc;
        }

        .cv-items li {
          margin-bottom: 2px;
          text-align: justify;
        }

        .cv-vspace {
          height: 8px;
        }

        .cv-hfill {
          flex: 1;
        }

        .preview-content a {
          color: #000;
          text-decoration: underline;
        }

        .preview-content code {
          font-family: 'Courier New', monospace;
          font-size: 10pt;
        }

        .preview-content strong {
          font-weight: bold;
        }

        .preview-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
