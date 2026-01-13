interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function InputPanel({ value, onChange, onClear }: InputPanelProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-800">CV Input</h2>
        <button
          onClick={onClear}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your CV content here (plain text or Markdown format)...

Example:
# John Doe
New York, NY | john@email.com | linkedin.com/in/johndoe

## Summary
Experienced software engineer with 5+ years...

## Experience
**Senior Developer** | Tech Company | Jan 2020 - Present
- Led development of key features
- Improved system performance by 40%

## Education
Bachelor of Science in Computer Science
University Name | 2015 - 2019

## Skills
Programming: Python, JavaScript, TypeScript
Frameworks: React, Node.js, Django"
          className="w-full h-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white"
        />
      </div>

      <div className="flex-shrink-0 flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{charCount.toLocaleString()} chars</span>
        <span>{wordCount.toLocaleString()} words</span>
      </div>
    </div>
  );
}
