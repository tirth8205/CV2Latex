import { useEffect, useRef, useState } from 'react';
import Prism from '../utils/prism-latex';

interface OutputPanelProps {
  value: string;
  onClear: () => void;
}

export function OutputPanel({ value, onClear }: OutputPanelProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && value) {
      Prism.highlightElement(codeRef.current);
    }
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-800">LaTeX Output</h2>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear
          </button>
          {value && (
            <>
              <button
                onClick={handleCopy}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  copyStatus === 'copied'
                    ? 'bg-green-100 text-green-700'
                    : copyStatus === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Error' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors whitespace-nowrap"
              >
                Download
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
        {value ? (
          <pre className="h-full overflow-auto p-3 m-0">
            <code ref={codeRef} className="language-latex text-sm">
              {value}
            </code>
          </pre>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center px-4">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
              <p className="text-sm">LaTeX output will appear here</p>
              <p className="text-xs mt-1">Paste your CV and click "Convert to LaTeX"</p>
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="flex-shrink-0 mt-2 text-xs text-gray-500">
          {value.split('\n').length.toLocaleString()} lines
        </div>
      )}
    </div>
  );
}
