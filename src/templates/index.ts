import type { SectionType } from '../types/cv';
import { professionalTemplate } from './professional';
import { modernTemplate } from './modern';
import { academicTemplate } from './academic';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  preamble: string;
  documentEnd: string;
  defaultSectionOrder: SectionType[];
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  professional: professionalTemplate,
  modern: modernTemplate,
  academic: academicTemplate,
};

export const DEFAULT_SECTION_ORDER: SectionType[] = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'awards',
  'certifications',
  'publications',
  'languages',
  'interests',
];

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES[id] || TEMPLATES.professional;
}

export function getTemplateList(): { id: string; name: string; description: string }[] {
  return Object.values(TEMPLATES).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));
}
