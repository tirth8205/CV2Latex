import type { ParsedCV, ExperienceEntry, EducationEntry, ProjectEntry, SkillCategory, GenericSection } from '../types/cv';
import { wrapDocument } from './template';
import { escapeLatex, escapeLatexPreserveFormatting, formatEmail, formatPhone, formatLink, stripMarkdown } from './escapeLatex';

function generateContactSection(cv: ParsedCV): string {
  const { contact } = cv;
  const lines: string[] = [];

  lines.push('\\begin{center}');
  lines.push(`    \\textbf{\\Huge \\scshape ${escapeLatex(stripMarkdown(contact.name))}} \\\\ \\vspace{1pt}`);

  const contactParts: string[] = [];

  if (contact.location) {
    contactParts.push(escapeLatex(contact.location));
  }

  if (contact.email) {
    contactParts.push(formatEmail(contact.email));
  }

  if (contact.phone) {
    contactParts.push(formatPhone(contact.phone));
  }

  if (contact.linkedin) {
    const displayText = contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const url = contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`;
    contactParts.push(formatLink(url, displayText));
  }

  if (contact.github) {
    const displayText = contact.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const url = contact.github.startsWith('http') ? contact.github : `https://${contact.github}`;
    contactParts.push(formatLink(url, displayText));
  }

  if (contact.website) {
    const displayText = contact.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    contactParts.push(formatLink(contact.website, displayText));
  }

  for (const link of contact.additionalLinks) {
    contactParts.push(formatLink(link.url, link.text));
  }

  if (contactParts.length > 0) {
    lines.push('    \\small');
    lines.push(`    ${contactParts.join(' $|$ ')}`);
  }

  lines.push('\\end{center}');

  return lines.join('\n');
}

function generateSummarySection(summary: string): string {
  const lines: string[] = [];

  lines.push('\\section{Professional Summary}');
  lines.push('\\small{');
  lines.push(escapeLatexPreserveFormatting(summary));
  lines.push('}');

  return lines.join('\n');
}

function generateExperienceSection(experience: ExperienceEntry[]): string {
  if (experience.length === 0) return '';

  const lines: string[] = [];

  lines.push('\\section{Professional Experience}');
  lines.push('\\resumeSubHeadingListStart');

  for (const entry of experience) {
    lines.push('');
    lines.push('\\resumeSubheading');
    // Format: {Company}{Date}{Position}{Location}
    lines.push(`{${escapeLatex(stripMarkdown(entry.company))}}{${escapeLatex(entry.dateRange)}}`);
    lines.push(`{${escapeLatex(stripMarkdown(entry.position))}}{${escapeLatex(entry.location || '')}}`);

    if (entry.bullets.length > 0) {
      lines.push('\\resumeItemListStart');
      for (const bullet of entry.bullets) {
        lines.push(`\\resumeItem{${escapeLatexPreserveFormatting(bullet)}}`);
      }
      lines.push('\\resumeItemListEnd');
    }
  }

  lines.push('');
  lines.push('\\resumeSubHeadingListEnd');

  return lines.join('\n');
}

function generateEducationSection(education: EducationEntry[]): string {
  if (education.length === 0) return '';

  const lines: string[] = [];

  lines.push('\\section{Education}');
  lines.push('\\resumeSubHeadingListStart');

  for (const entry of education) {
    lines.push('');
    lines.push('\\resumeSubheading');
    lines.push(`{${escapeLatex(stripMarkdown(entry.institution))}}{${escapeLatex(entry.dateRange)}}`);
    // Put grade/details in field 4 (location field) if available
    const gradeInfo = entry.details.length > 0 ? entry.details[0] : (entry.location || '');
    lines.push(`{${escapeLatex(stripMarkdown(entry.degree))}}{${escapeLatex(gradeInfo)}}`);
  }

  lines.push('');
  lines.push('\\resumeSubHeadingListEnd');

  return lines.join('\n');
}

function generateSkillsSection(skills: SkillCategory[]): string {
  if (skills.length === 0) return '';

  const lines: string[] = [];

  lines.push('\\section{Technical Skills}');
  lines.push('\\begin{itemize}[leftmargin=0in, label={}]');
  lines.push('\\small{\\item{');

  const skillLines: string[] = [];
  for (const category of skills) {
    if (category.category) {
      // Remove trailing colon from category if present (to avoid double colons)
      const cleanCategory = stripMarkdown(category.category).replace(/:$/, '');
      skillLines.push(`\\textbf{${escapeLatex(cleanCategory)}}: ${escapeLatexPreserveFormatting(category.skills)}`);
    } else {
      skillLines.push(escapeLatexPreserveFormatting(category.skills));
    }
  }

  lines.push(skillLines.join(' \\\\\n'));

  lines.push('}}');
  lines.push('\\end{itemize}');

  return lines.join('\n');
}

function generateProjectsSection(projects: ProjectEntry[]): string {
  if (projects.length === 0) return '';

  const lines: string[] = [];

  lines.push('\\section{Industry Projects}');
  lines.push('\\resumeSubHeadingListStart');

  for (const project of projects) {
    lines.push('');

    // Format: {\textbf{ProjectName} \\ (tech stack) $|$ \textbf{Award/Date}}{}
    // Tech stack goes on new line with \\
    let heading = `\\textbf{${escapeLatex(stripMarkdown(project.name))}}`;
    if (project.technologies) {
      heading += ` \\\\ (${escapeLatex(project.technologies)})`;
    }
    if (project.dateRange) {
      heading += ` $|$ \\textbf{${escapeLatex(project.dateRange)}}`;
    }

    lines.push('\\resumeProjectHeading');
    lines.push(`{${heading}}{}`);

    if (project.bullets.length > 0) {
      lines.push('\\resumeItemListStart');
      for (const bullet of project.bullets) {
        lines.push(`\\resumeItem{${escapeLatexPreserveFormatting(bullet)}}`);
      }
      lines.push('\\resumeItemListEnd');
    }
  }

  lines.push('');
  lines.push('\\resumeSubHeadingListEnd');

  return lines.join('\n');
}

function generateSimpleListSection(title: string, items: string[]): string {
  if (items.length === 0) return '';

  const lines: string[] = [];

  // Clean the title of markdown
  const cleanTitle = stripMarkdown(title);

  lines.push(`\\section{${escapeLatex(cleanTitle)}}`);
  lines.push('\\resumeItemListStart');

  for (const item of items) {
    lines.push(`\\resumeItem{${escapeLatexPreserveFormatting(item)}}`);
  }

  lines.push('\\resumeItemListEnd');

  return lines.join('\n');
}

function generateAwardsSection(title: string, items: string[]): string {
  if (items.length === 0) return '';

  const lines: string[] = [];

  // Clean the title of markdown
  const cleanTitle = stripMarkdown(title);

  lines.push(`\\section{${escapeLatex(cleanTitle)}}`);
  lines.push('\\begin{itemize}[leftmargin=0in, label={}]');

  for (const item of items) {
    lines.push('\\small{\\item{');

    // Check if item has **title** pattern
    const boldMatch = item.match(/^\*\*([^*]+)\*\*\s*(.*)/s);
    if (boldMatch) {
      const awardTitle = boldMatch[1];
      const description = boldMatch[2];
      lines.push(`\\textbf{${escapeLatex(awardTitle)}} \\\\`);
      if (description.trim()) {
        lines.push(escapeLatexPreserveFormatting(description.trim()) + ' \\\\');
      }
    } else {
      lines.push(escapeLatexPreserveFormatting(item) + ' \\\\');
    }

    lines.push('}}');
  }

  lines.push('\\end{itemize}');

  return lines.join('\n');
}

function generateGenericSection(section: GenericSection): string {
  return generateSimpleListSection(section.title, section.content);
}

export function generateLatex(cv: ParsedCV): string {
  const sections: string[] = [];

  // Contact/Header section
  sections.push(generateContactSection(cv));

  // Summary/Objective
  if (cv.summary) {
    sections.push('');
    sections.push(generateSummarySection(cv.summary));
  }

  // Skills (moved up per expected format)
  if (cv.skills.length > 0) {
    sections.push('');
    sections.push(generateSkillsSection(cv.skills));
  }

  // Experience
  if (cv.experience.length > 0) {
    sections.push('');
    sections.push(generateExperienceSection(cv.experience));
  }

  // Projects
  if (cv.projects.length > 0) {
    sections.push('');
    sections.push(generateProjectsSection(cv.projects));
  }

  // Education
  if (cv.education.length > 0) {
    sections.push('');
    sections.push(generateEducationSection(cv.education));
  }

  // Awards/Achievements (using special format)
  if (cv.awards.length > 0) {
    sections.push('');
    sections.push(generateAwardsSection('Achievements', cv.awards));
  }

  // Certifications
  if (cv.certifications.length > 0) {
    sections.push('');
    sections.push(generateSimpleListSection('Certifications', cv.certifications));
  }

  // Publications
  if (cv.publications.length > 0) {
    sections.push('');
    sections.push(generateSimpleListSection('Publications', cv.publications));
  }

  // Languages
  if (cv.languages.length > 0) {
    sections.push('');
    sections.push(generateSimpleListSection('Languages', cv.languages));
  }

  // Interests
  if (cv.interests.length > 0) {
    sections.push('');
    sections.push(generateSimpleListSection('Interests', cv.interests));
  }

  // Generic sections
  for (const section of cv.genericSections) {
    sections.push('');
    sections.push(generateGenericSection(section));
  }

  return wrapDocument(sections.join('\n'));
}
