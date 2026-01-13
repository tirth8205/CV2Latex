interface ActionButtonsProps {
  onConvert: () => void;
  isConverting: boolean;
  hasInput: boolean;
}

export function ActionButtons({ onConvert, isConverting, hasInput }: ActionButtonsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <button
        onClick={onConvert}
        disabled={!hasInput || isConverting}
        className={`px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all transform ${
          hasInput && !isConverting
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isConverting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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

      <p className="mt-3 text-sm text-gray-500 text-center max-w-md">
        Paste your CV in plain text or Markdown format, then click to generate a professional LaTeX
        document ready for compilation.
      </p>
    </div>
  );
}
