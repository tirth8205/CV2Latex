export interface ContactInfo {
  name: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  additionalLinks: { url: string; text: string }[];
}

export interface ExperienceEntry {
  company: string;
  position: string;
  location?: string;
  dateRange: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  location?: string;
  dateRange: string;
  details: string[];
}

export interface ProjectEntry {
  name: string;
  technologies?: string;
  dateRange?: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  skills: string;
}

export interface GenericSection {
  title: string;
  content: string[];
}

export type SectionType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'publications'
  | 'awards'
  | 'languages'
  | 'interests'
  | 'generic';

export interface ParsedSection {
  type: SectionType;
  title: string;
  rawContent: string;
}

export interface ParsedCV {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  projects: ProjectEntry[];
  certifications: string[];
  publications: string[];
  awards: string[];
  languages: string[];
  interests: string[];
  genericSections: GenericSection[];
}
