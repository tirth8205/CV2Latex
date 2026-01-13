import type {
  ParsedCV,
  ContactInfo,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  SkillCategory,
  SectionType,
} from '../types/cv';

// Common section header patterns
const SECTION_PATTERNS: Record<string, SectionType> = {
  'summary': 'summary',
  'professional summary': 'summary',
  'profile': 'summary',
  'objective': 'summary',
  'about': 'summary',
  'about me': 'summary',
  'experience': 'experience',
  'work experience': 'experience',
  'professional experience': 'experience',
  'employment': 'experience',
  'employment history': 'experience',
  'work history': 'experience',
  'education': 'education',
  'academic background': 'education',
  'qualifications': 'education',
  'skills': 'skills',
  'technical skills': 'skills',
  'core competencies': 'skills',
  'competencies': 'skills',
  'technologies': 'skills',
  'expertise': 'skills',
  'projects': 'projects',
  'personal projects': 'projects',
  'key projects': 'projects',
  'selected projects': 'projects',
  'industry projects': 'projects',
  'certifications': 'certifications',
  'certificates': 'certifications',
  'licenses': 'certifications',
  'publications': 'publications',
  'papers': 'publications',
  'research': 'publications',
  'awards': 'awards',
  'honors': 'awards',
  'achievements': 'awards',
  'languages': 'languages',
  'interests': 'interests',
  'hobbies': 'interests',
  'activities': 'interests',
};

// Regex patterns
const EMAIL_REGEX = /[\w.-]+@[\w.-]+\.\w+/gi;
const PHONE_REGEX = /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi;
const URL_REGEX = /https?:\/\/[^\s]+/gi;

// Normalize bullet point markers (handles BOLD 0, •, -, *, etc.)
function normalizeBulletMarker(line: string): { isBullet: boolean; content: string } {
  const trimmed = line.trim();

  // Check for "BOLD 0" pattern (common copy-paste artifact)
  if (trimmed.startsWith('BOLD 0')) {
    return { isBullet: true, content: trimmed.replace(/^BOLD\s*0\s*/, '').trim() };
  }

  // Check for standard bullet markers
  const bulletMatch = trimmed.match(/^[-•*]\s+(.*)$/);
  if (bulletMatch) {
    return { isBullet: true, content: bulletMatch[1] };
  }

  return { isBullet: false, content: trimmed };
}

// Check if line is a separator (em-dash line, hr, etc.)
function isSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '—' || trimmed === '---' || trimmed === '***' || trimmed === '___' || /^[-—=]{3,}$/.test(trimmed);
}

// Detect if a line is a section header
function isSectionHeader(line: string): { isHeader: boolean; sectionType: SectionType; title: string } {
  const trimmed = line.trim();

  // Skip empty lines and separators
  if (!trimmed || isSeparatorLine(trimmed)) {
    return { isHeader: false, sectionType: 'generic', title: '' };
  }

  // Check for markdown headers (## or ###)
  const markdownMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
  if (markdownMatch) {
    const title = markdownMatch[1].trim().replace(/\*+/g, ''); // Remove all asterisks
    const normalizedTitle = title.toLowerCase().replace(/[:\-_]/g, ' ').trim();
    const sectionType = SECTION_PATTERNS[normalizedTitle] || 'generic';
    return { isHeader: true, sectionType, title };
  }

  // Check for **Bold Section Headers** or *Bold** (malformed markdown)
  // Match lines that are primarily asterisks around text
  const boldMatch = trimmed.match(/^\*{1,2}([^*]+)\*{1,2}\s*$/);
  if (boldMatch) {
    const title = boldMatch[1].trim();
    const normalizedTitle = title.toLowerCase().replace(/[:\-_]/g, ' ').trim();
    const sectionType = SECTION_PATTERNS[normalizedTitle] || 'generic';
    // Only treat as header if it matches a known section
    if (sectionType !== 'generic') {
      return { isHeader: true, sectionType, title };
    }
  }

  // Check for ALL CAPS headers (common CV format)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && /^[A-Z\s]+$/.test(trimmed)) {
    const normalizedTitle = trimmed.toLowerCase().trim();
    const sectionType = SECTION_PATTERNS[normalizedTitle] || 'generic';
    return { isHeader: true, sectionType, title: trimmed };
  }

  // Check for headers ending with colon
  const colonMatch = trimmed.match(/^([A-Za-z\s]+):$/);
  if (colonMatch) {
    const title = colonMatch[1].trim();
    const normalizedTitle = title.toLowerCase();
    const sectionType = SECTION_PATTERNS[normalizedTitle] || 'generic';
    return { isHeader: true, sectionType, title };
  }

  // Check for known section names (strip all asterisks first)
  const strippedLine = trimmed.replace(/\*+/g, '').trim();
  const lowerStripped = strippedLine.toLowerCase();
  for (const [pattern, type] of Object.entries(SECTION_PATTERNS)) {
    if (lowerStripped === pattern || lowerStripped === pattern + ':') {
      return { isHeader: true, sectionType: type, title: strippedLine.replace(/:$/, '') };
    }
  }

  return { isHeader: false, sectionType: 'generic', title: '' };
}

// Parse contact information from the first few lines
function parseContactInfo(lines: string[]): { contact: ContactInfo; consumedLines: number } {
  const contact: ContactInfo = {
    name: '',
    additionalLinks: [],
  };

  let consumedLines = 0;
  const headerLines: string[] = [];

  // Collect lines until we hit a section header or separator
  for (let i = 0; i < lines.length && i < 10; i++) {
    const line = lines[i].trim();

    if (isSeparatorLine(line)) {
      consumedLines = i + 1;
      break;
    }

    const { isHeader } = isSectionHeader(line);

    if (isHeader && i > 0) {
      break;
    }

    if (line) {
      headerLines.push(line);
      consumedLines = i + 1;
    }
  }

  // First non-empty line is typically the name
  if (headerLines.length > 0) {
    // Remove markdown header markers and bold markers if present
    contact.name = headerLines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
  }

  // Parse remaining header lines for contact info
  for (let i = 1; i < headerLines.length; i++) {
    const line = headerLines[i];

    // Extract emails
    const emails = line.match(EMAIL_REGEX);
    if (emails && !contact.email) {
      contact.email = emails[0];
    }

    // Extract phone numbers
    const phones = line.match(PHONE_REGEX);
    if (phones && !contact.phone) {
      contact.phone = phones[0];
    }

    // Extract LinkedIn
    const linkedins = line.match(LINKEDIN_REGEX);
    if (linkedins && !contact.linkedin) {
      contact.linkedin = linkedins[0];
    }

    // Extract GitHub
    const githubs = line.match(GITHUB_REGEX);
    if (githubs && !contact.github) {
      contact.github = githubs[0];
    }

    // Extract other URLs
    const urls = line.match(URL_REGEX);
    if (urls) {
      for (const url of urls) {
        if (!url.includes('linkedin.com') && !url.includes('github.com')) {
          if (!contact.website) {
            contact.website = url;
          } else {
            contact.additionalLinks.push({ url, text: url.replace(/^https?:\/\/(www\.)?/, '') });
          }
        }
      }
    }

    // Try to extract location (city, state/country pattern)
    if (!contact.location) {
      const locationMatch = line.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/);
      if (locationMatch && !line.match(EMAIL_REGEX) && !line.match(PHONE_REGEX)) {
        contact.location = locationMatch[1];
      }
    }
  }

  return { contact, consumedLines };
}

// Parse experience entries from section content
function parseExperienceSection(content: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: ExperienceEntry | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0 && currentEntry) {
      currentEntry.bullets.push(paragraphBuffer.join(' '));
      paragraphBuffer = [];
    }
  };

  // Date patterns
  const datePatterns = [
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*[-–—]\s*(Present|Current|Now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b/i,
    /\b(Sept?)\s+\d{4}\s*[-–—]\s*(Present|Current|Now|(?:Sept?|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Oct|Nov|Dec)\s+\d{4})\b/i,
    /\b\d{4}\s*[-–—]\s*(Present|Current|Now|\d{4})\b/i,
    /\b\d{1,2}\/\d{4}\s*[-–—]\s*(Present|Current|Now|\d{1,2}\/\d{4})\b/i,
  ];

  const parseEntryHeader = (line: string): ExperienceEntry | null => {
    // Check if line has a date
    let dateRange = '';
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateRange = match[0];
        break;
      }
    }

    if (!dateRange) return null;

    // Split on pipe (|) or em-dash/dash and filter empty parts
    // Prioritize pipe separator as it's more common in structured CVs
    let parts: string[];
    if (line.includes('|')) {
      parts = line.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);
    } else {
      parts = line.split(/\s*[—–]\s*/).map(p => p.trim()).filter(Boolean);
    }

    if (parts.length < 2) return null;

    let company = '';
    let position = '';
    let location = '';

    for (const part of parts) {
      // Skip the date part
      if (datePatterns.some(p => part.match(p))) {
        continue;
      }
      // Strip markdown bold markers from part for comparison
      const cleanPart = part.replace(/^\*\*|\*\*$/g, '').trim();

      // Check if it looks like a job title (common title words) - check this FIRST
      // Job titles often have these words and may have parentheses like "(Contract)"
      if (cleanPart.match(/\b(Engineer|Developer|Manager|Director|Analyst|Designer|Consultant|Lead|Senior|Junior|Fellow|Assistant|Intern|Associate|Specialist|Coordinator|Researcher)\b/i) && !position) {
        position = cleanPart;
      }
      // Check if it's an institution/organization with parenthetical description
      // (but not already identified as a job title)
      else if (cleanPart.match(/\([^)]+\)/) && !company) {
        company = cleanPart;
      }
      // If it looks like a standalone location (not part of an institution name)
      // Only match if it's a short string that looks like just a location
      else if (cleanPart.match(/^(Remote|USA|UK|Canada|India|Singapore|NY|CA|TX|London|New York|San Francisco)$/i) && !location) {
        location = cleanPart;
      }
      // First substantial part with bold is usually position
      else if (!position && part.startsWith('**')) {
        position = cleanPart;
      }
      // Otherwise might be company
      else if (!company && cleanPart.length > 3) {
        company = cleanPart;
      }
    }

    return {
      company,
      position,
      location,
      dateRange,
      bullets: [],
    };
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines and separators
    if (!trimmed || isSeparatorLine(trimmed)) {
      flushParagraph();
      continue;
    }

    // Check for bullet points (including BOLD 0)
    const { isBullet, content: bulletContent } = normalizeBulletMarker(trimmed);
    const lineToCheck = isBullet ? bulletContent : trimmed;

    // Try to parse as entry header (even if it's a bullet - could be a new entry)
    const newEntry = parseEntryHeader(lineToCheck);

    if (newEntry && (newEntry.company || newEntry.position)) {
      flushParagraph();

      // Save previous entry if exists
      if (currentEntry) {
        entries.push(currentEntry);
      }

      currentEntry = newEntry;
    } else if (isBullet && bulletContent && currentEntry) {
      flushParagraph();
      // Regular bullet content - remove any leading em-dash but preserve **bold** markers
      const cleanBullet = bulletContent.replace(/^[—–-]\s*/, '').trim();
      if (cleanBullet) {
        currentEntry.bullets.push(cleanBullet);
      }
    } else if (currentEntry && trimmed) {
      // Non-bullet text - could be a paragraph description
      paragraphBuffer.push(trimmed);
    }
  }

  // Flush any remaining paragraph
  flushParagraph();

  // Don't forget the last entry
  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

// Parse education entries
function parseEducationSection(content: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: EducationEntry | null = null;

  // Date patterns for education
  const datePatterns = [
    /\b(Sept?|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Oct|Nov|Dec)\s+\d{4}\s*[-–—]\s*(Present|Sept?|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Oct|Nov|Dec)\s+\d{4}\b/i,
    /\b(\d{4})\s*[-–—]\s*(Present|\d{4})\b/i,
    /\b(Aug|Sep|Sept)\s+\d{4}\s*[-–—]\s*(Jun|Jul|Aug|Sep|Sept)\s+\d{4}\b/i,
  ];

  const parseEducationEntry = (line: string): EducationEntry | null => {
    // Check if line has a date
    let dateRange = '';
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateRange = match[0];
        break;
      }
    }

    // Check for education keywords
    const hasEducationKeyword = line.match(/\b(University|College|Institute|School|Bachelor|Master|Ph\.?D|MSc|BSc|MBA)\b/i);

    if (!dateRange && !hasEducationKeyword) return null;

    // Split on pipe (|) or em-dash and filter empty parts
    let parts: string[];
    if (line.includes('|')) {
      parts = line.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);
    } else {
      parts = line.split(/\s*[—–]\s*/).map(p => p.trim()).filter(Boolean);
    }

    let institution = '';
    let degree = '';
    let location = '';
    const details: string[] = [];

    for (const part of parts) {
      // Strip markdown bold markers
      const cleanPart = part.replace(/^\*\*|\*\*$/g, '').trim();

      // Skip the date part
      if (datePatterns.some(p => cleanPart.match(p))) {
        continue;
      }
      // Check if it's a grade
      if (cleanPart.match(/Grade:|First Class|Distinction|GPA|cum laude/i)) {
        details.push(cleanPart);
      }
      // Check if it's a university/institution
      else if (cleanPart.match(/University|College|Institute|School/i)) {
        institution = cleanPart;
      }
      // Check if it's a degree (MSc, BSc, Bachelor, Master, etc.)
      else if (cleanPart.match(/\b(MSc|BSc|Bachelor|Master|Ph\.?D|MBA|BA|MA|BEng|MEng)\b/i) && !degree) {
        degree = cleanPart;
      }
      // Otherwise might be a degree
      else if (!degree && cleanPart.length > 3) {
        degree = cleanPart;
      }
    }

    // If we didn't find an institution but have a degree, swap them
    if (!institution && degree) {
      institution = degree;
      degree = '';
    }

    if (!institution && parts.length > 0) {
      institution = parts[0].replace(/^\*\*|\*\*$/g, '').trim();
    }

    return {
      institution,
      degree,
      location,
      dateRange,
      details,
    };
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || isSeparatorLine(trimmed)) continue;

    // Normalize bullet markers
    const { isBullet, content: lineContent } = normalizeBulletMarker(trimmed);
    const processLine = isBullet ? lineContent : trimmed;

    // Remove leading em-dash if present
    const cleanLine = processLine.replace(/^[—–-]\s*/, '').trim();

    // Try to parse as education entry
    const newEntry = parseEducationEntry(cleanLine);

    if (newEntry && newEntry.institution) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = newEntry;
    } else if (currentEntry && cleanLine) {
      // Additional details for current entry
      currentEntry.details.push(cleanLine);
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

// Parse skills section
function parseSkillsSection(content: string): SkillCategory[] {
  const categories: SkillCategory[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and separators
    if (!trimmed || isSeparatorLine(trimmed)) continue;

    // Normalize bullet markers
    const { content: lineContent } = normalizeBulletMarker(trimmed);
    const processLine = lineContent || trimmed;

    // Check for "Category: skills" or "**Category**: skills" pattern
    // Also handle "BOLD 0 Category description" pattern
    let category = '';
    let skills = processLine;

    // Try to extract bold category: **Category**: or **Category**:
    const boldCategoryMatch = processLine.match(/^\*\*([^*]+)\*\*[:\s]*(.*)$/);
    if (boldCategoryMatch) {
      category = boldCategoryMatch[1].trim();
      skills = boldCategoryMatch[2].trim() || processLine;
    } else {
      // Try regular "Category:" pattern
      const colonMatch = processLine.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch) {
        category = colonMatch[1].trim();
        skills = colonMatch[2].trim();
      }
    }

    if (skills) {
      categories.push({
        category,
        skills,
      });
    }
  }

  return categories;
}

// Parse projects section
function parseProjectsSection(content: string): ProjectEntry[] {
  const projects: ProjectEntry[] = [];
  const lines = content.split('\n');

  let currentProject: ProjectEntry | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0 && currentProject) {
      currentProject.bullets.push(paragraphBuffer.join(' '));
      paragraphBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || isSeparatorLine(trimmed)) {
      flushParagraph();
      continue;
    }

    // Normalize bullet markers
    const { isBullet, content: lineContent } = normalizeBulletMarker(trimmed);
    const processLine = isBullet ? lineContent : trimmed;

    // Check if this looks like a project heading
    // Patterns:
    // - "BOLD 0 (tech stack) — Award/Date"
    // - "**Project Name: Subtitle** (tech) — Date"
    // - "**Project Name** | Date"
    // - Line with parenthetical tech stack
    const techMatch = processLine.match(/\(([^)]+(?:Python|React|AWS|API|FastAPI|PyTorch|Docker|Kubernetes|Redis|PostgreSQL|Claude|LangChain|Node|TypeScript|JavaScript|WebSocket|Hugging Face|Anthropic|OpenAI)[^)]*)\)/i);
    const hasAwardOrDate = processLine.match(/\b(1st|2nd|3rd|Place|Award|Hackathon|\d{4}|Present|Research|Prototype)\b/i);

    // Split on pipe or em-dash/en-dash/regular dash (but not dashes within words)
    // Use \s+[-–—]\s+ to require spaces around dashes to avoid splitting hyphenated words
    let separatorParts: string[];
    if (processLine.includes('|')) {
      separatorParts = processLine.split(/\s*\|\s*/);
    } else if (processLine.match(/\s+[—–-]\s+/)) {
      separatorParts = processLine.split(/\s+[—–-]\s+/);
    } else {
      separatorParts = [processLine];
    }

    // Check if this is a project header (has tech stack or award mention)
    if ((techMatch || hasAwardOrDate) && separatorParts.length >= 1) {
      flushParagraph();

      if (currentProject) {
        projects.push(currentProject);
      }

      let projectName = separatorParts[0].trim();
      let technologies = '';
      let dateRange = '';

      // Extract tech stack from parentheses - remove it from project name
      if (techMatch) {
        technologies = techMatch[1];
        // Remove the tech stack from the first part (project name portion)
        projectName = projectName.replace(techMatch[0], '').trim();
      }

      // Look for date/award info in remaining parts
      for (let j = 1; j < separatorParts.length; j++) {
        const part = separatorParts[j].trim();
        if (part.match(/\d{4}|Present|Hackathon|Place|Award|Research|Prototype/i)) {
          // Keep markdown markers in dateRange for later processing
          dateRange = part.replace(/\*+/g, '').trim();
        }
      }

      // Strip all markdown markers from project name (including trailing **)
      projectName = projectName.replace(/\*+/g, '').trim();

      currentProject = {
        name: projectName,
        technologies,
        dateRange,
        bullets: [],
      };
    } else if (isBullet && currentProject) {
      flushParagraph();
      // Keep the bullet content as-is to preserve **bold** markers
      currentProject.bullets.push(processLine);
    } else if (currentProject && processLine) {
      // Paragraph content - preserve formatting
      paragraphBuffer.push(processLine);
    }
  }

  flushParagraph();

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
}

// Parse simple list sections (certifications, awards, etc.)
function parseSimpleListSection(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      let combined = paragraphBuffer.join(' ');

      // Clean up broken markdown (e.g., "**Title" and "** description" on separate lines)
      // This fixes cases where ** markers got split across lines
      combined = combined.replace(/\*\*\s+\*\*/g, ' '); // Remove empty bold markers
      combined = combined.replace(/\*\*\s*\*\*/g, ''); // Remove consecutive **

      // Check if this combined text contains multiple bold items (common in awards)
      // Pattern: **Title1** description **Title2** description
      const boldPattern = /\*\*[^*]+\*\*/g;
      const boldMatches = combined.match(boldPattern);

      if (boldMatches && boldMatches.length > 1) {
        // Split on the start of each **bold** section
        const parts = combined.split(/(?=\*\*[^*]+\*\*)/);
        for (const part of parts) {
          const trimmedPart = part.trim();
          if (trimmedPart && trimmedPart !== '**') {
            items.push(trimmedPart);
          }
        }
      } else if (combined.trim()) {
        items.push(combined.trim());
      }

      paragraphBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || isSeparatorLine(trimmed)) {
      flushParagraph();
      continue;
    }

    // Normalize bullet markers
    const { isBullet, content: lineContent } = normalizeBulletMarker(trimmed);
    const processLine = isBullet ? lineContent : trimmed;

    if (processLine) {
      if (isBullet) {
        flushParagraph();
        items.push(processLine);
      } else {
        paragraphBuffer.push(processLine);
      }
    }
  }

  flushParagraph();

  // Post-process: join items where bold markers are split across lines
  // e.g., "**Title" followed by "** description" should become "**Title** description"
  const processedItems: string[] = [];
  let pendingItem = '';

  for (const item of items) {
    // Check if item starts with ** but doesn't have a complete **text** pattern
    const startsWithClosingBold = item.startsWith('**') && !item.match(/^\*\*[^*]+\*\*/);

    if (pendingItem && startsWithClosingBold) {
      // Join with previous item - this looks like a split bold
      processedItems.push(pendingItem + item);
      pendingItem = '';
    } else {
      if (pendingItem) {
        processedItems.push(pendingItem);
      }
      // Check if this item has unclosed bold
      const openBolds = (item.match(/\*\*/g) || []).length;
      if (openBolds % 2 !== 0) {
        pendingItem = item;
      } else {
        processedItems.push(item);
        pendingItem = '';
      }
    }
  }

  if (pendingItem) {
    processedItems.push(pendingItem);
  }

  return processedItems;
}

// Main parser function
export function parseCV(input: string): ParsedCV {
  const lines = input.split('\n');

  // Initialize result
  const result: ParsedCV = {
    contact: { name: '', additionalLinks: [] },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    publications: [],
    awards: [],
    languages: [],
    interests: [],
    genericSections: [],
  };

  // Parse contact info from header
  const { contact, consumedLines } = parseContactInfo(lines);
  result.contact = contact;

  // Parse sections
  let currentSection: SectionType | null = null;
  let currentSectionTitle = '';
  let currentSectionContent: string[] = [];

  const processSection = () => {
    if (!currentSection || currentSectionContent.length === 0) return;

    const content = currentSectionContent.join('\n');

    switch (currentSection) {
      case 'summary':
        result.summary = content.trim();
        break;
      case 'experience':
        result.experience = parseExperienceSection(content);
        break;
      case 'education':
        result.education = parseEducationSection(content);
        break;
      case 'skills':
        result.skills = parseSkillsSection(content);
        break;
      case 'projects':
        result.projects = parseProjectsSection(content);
        break;
      case 'certifications':
        result.certifications = parseSimpleListSection(content);
        break;
      case 'publications':
        result.publications = parseSimpleListSection(content);
        break;
      case 'awards':
        result.awards = parseSimpleListSection(content);
        break;
      case 'languages':
        result.languages = parseSimpleListSection(content);
        break;
      case 'interests':
        result.interests = parseSimpleListSection(content);
        break;
      case 'generic':
        result.genericSections.push({
          title: currentSectionTitle,
          content: parseSimpleListSection(content),
        });
        break;
    }
  };

  for (let i = consumedLines; i < lines.length; i++) {
    const line = lines[i];

    // Skip separator lines when looking for headers
    if (isSeparatorLine(line.trim())) {
      continue;
    }

    const { isHeader, sectionType, title } = isSectionHeader(line);

    if (isHeader) {
      // Process previous section
      processSection();

      // Start new section
      currentSection = sectionType;
      currentSectionTitle = title;
      currentSectionContent = [];
    } else {
      currentSectionContent.push(line);
    }
  }

  // Process last section
  processSection();

  return result;
}
