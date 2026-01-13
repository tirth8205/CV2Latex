import { useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { parseCV } from './utils/parser';
import { generateLatex } from './utils/latexGenerator';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!input.trim()) return;

    setIsConverting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const parsed = parseCV(input);
      const latex = generateLatex(parsed);
      setOutput(latex);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };

  const handleClearInput = () => {
    setInput('');
    setError(null);
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">CV to LaTeX Converter</h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Convert your CV to a professional LaTeX document
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <button
                onClick={handleConvert}
                disabled={!input.trim() || isConverting}
                className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-md transition-all ${
                  input.trim() && !isConverting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    Converting...
                  </span>
                ) : (
                  'Convert to LaTeX'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800">Conversion Error</h3>
              <p className="text-sm text-red-600 mt-1 break-words">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Split Panels */}
        <div className="h-full flex flex-col lg:flex-row gap-4">
          {/* Left Panel - Input */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
            <InputPanel value={input} onChange={setInput} onClear={handleClearInput} />
          </div>

          {/* Right Panel - Output */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
            <OutputPanel value={output} onClear={handleClearOutput} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-xs text-gray-500 text-center">
            Use **bold** formatting in your CV. Compile the .tex file with pdflatex.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
