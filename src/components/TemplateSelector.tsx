import { getTemplateList } from '../templates';

interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const templates = getTemplateList();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="template-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
        Template:
      </label>
      <select
        id="template-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
}
