import { useState, useEffect, useCallback, useRef } from 'react';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { TemplateSelector } from './components/TemplateSelector';
import { SectionOrderModal } from './components/SectionOrderModal';
import { parseCV } from './utils/parser';
import { generateLatex } from './utils/latexGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { SAMPLE_CV } from './data/sampleCV';
import { DEFAULT_SECTION_ORDER } from './templates';
import type { ParsedCV, SectionType } from './types/cv';

interface ParsingWarning {
  type: 'info' | 'warning';
  message: string;
}

function App() {
  const [input, setInput] = useLocalStorage('cv2latex-input', '');
  const [output, setOutput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ParsingWarning[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [templateId, setTemplateId] = useLocalStorage('cv2latex-template', 'professional');
  const [sectionOrder, setSectionOrder] = useLocalStorage<SectionType[]>('cv2latex-section-order', DEFAULT_SECTION_ORDER);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [lastParsedCV, setLastParsedCV] = useState<ParsedCV | null>(null);
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeCV = useCallback((parsed: ParsedCV, cvInput: string): ParsingWarning[] => {
    const result: ParsingWarning[] = [];

    if (!parsed.contact.name) {
      result.push({ type: 'warning', message: 'No name detected. Add your name at the top of the CV.' });
    }
    if (!parsed.contact.email) {
      result.push({ type: 'info', message: 'No email detected. Consider adding contact information.' });
    }
    if (!parsed.summary) {
      result.push({ type: 'info', message: 'No summary section detected. A professional summary can strengthen your CV.' });
    }
    if (parsed.experience.length === 0) {
      result.push({ type: 'warning', message: 'No experience section detected. Use "## Experience" as a header.' });
    }
    if (parsed.education.length === 0) {
      result.push({ type: 'info', message: 'No education section detected. Use "## Education" as a header.' });
    }
    if (parsed.skills.length === 0) {
      result.push({ type: 'info', message: 'No skills section detected. Use "## Skills" as a header.' });
    }

    if (cvInput && !cvInput.includes('**')) {
      result.push({
        type: 'info',
        message: 'Tip: Use **double asterisks** around text to make it bold in the output.'
      });
    }

    return result;
  }, []);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) return;

    setIsConverting(true);
    setError(null);
    setWarnings([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const parsed = parseCV(input);
      const latex = generateLatex(parsed, templateId, sectionOrder);
      setOutput(latex);
      setLastParsedCV(parsed);

      const newWarnings = analyzeCV(parsed, input);
      setWarnings(newWarnings);
      if (newWarnings.length > 0) {
        setShowWarnings(true);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  }, [input, templateId, sectionOrder, analyzeCV]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvert]);

  // Auto-regenerate when template or section order changes (only if already converted)
  useEffect(() => {
    if (lastParsedCV && output) {
      const latex = generateLatex(lastParsedCV, templateId, sectionOrder);
      setOutput(latex);
    }
  }, [templateId, sectionOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearInput = () => {
    setInput('');
    setError(null);
    setWarnings([]);
  };

  const handleClearOutput = () => {
    setOutput('');
    setWarnings([]);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_CV);
    setError(null);
    setWarnings([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      setError(null);
      setWarnings([]);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon = () => {
    if (theme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    if (theme === 'light') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">CV to LaTeX Converter</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                Convert your CV to a professional LaTeX document
                <span className="ml-2 text-gray-400 dark:text-gray-500">(Ctrl+Enter to convert)</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TemplateSelector value={templateId} onChange={setTemplateId} />

              <button
                onClick={() => setShowSectionModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Reorder sections"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden lg:inline">Reorder</span>
              </button>

              <button
                onClick={cycleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={`Theme: ${theme}`}
              >
                <ThemeIcon />
              </button>

              <button
                onClick={handleLoadSample}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sample
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </label>

              <button
                onClick={handleConvert}
                disabled={!input.trim() || isConverting}
                className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-lg shadow-md transition-all ${
                  input.trim() && !isConverting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isConverting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Converting...</span>
                  </span>
                ) : (
                  <>
                    <span className="sm:hidden">Convert</span>
                    <span className="hidden sm:inline">Convert to LaTeX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-4">
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Conversion Error</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1 break-words">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="flex-shrink-0 text-red-500 hover:text-red-700 dark:hover:text-red-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {showWarnings && warnings.length > 0 && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Parsing Feedback</h3>
                  <ul className="mt-1 space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className={`text-sm ${warning.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`}>
                        {warning.type === 'warning' ? '!' : '*'} {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button onClick={() => setShowWarnings(false)} className="flex-shrink-0 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="h-full flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
            <InputPanel
              value={input}
              onChange={setInput}
              onClear={handleClearInput}
              onLoadSample={handleLoadSample}
              onFileUpload={() => fileInputRef.current?.click()}
            />
          </div>

          <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
            <OutputPanel value={output} onClear={handleClearOutput} />
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Use **bold** formatting in your CV. Your input is auto-saved locally.
          </p>
        </div>
      </footer>

      <SectionOrderModal
        isOpen={showSectionModal}
        onClose={() => setShowSectionModal(false)}
        sectionOrder={sectionOrder}
        onSave={setSectionOrder}
        parsedCV={lastParsedCV}
      />
    </div>
  );
}

export default App;
