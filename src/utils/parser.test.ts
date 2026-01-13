import { describe, it, expect } from 'vitest';
import { parseCV } from './parser';

// ============================================================================
// parseContactInfo Tests
// ============================================================================

describe('parseContactInfo', () => {
  it('extracts name from first line', () => {
    const input = `John Doe
john@email.com`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
  });

  it('extracts name with markdown header', () => {
    const input = `# John Doe
john@email.com`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
  });

  it('extracts name with bold markers', () => {
    const input = `**John Doe**
john@email.com`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
  });

  it('extracts email address', () => {
    const input = `John Doe
john.doe@example.com
555-123-4567`;
    const result = parseCV(input);
    expect(result.contact.email).toBe('john.doe@example.com');
  });

  it('extracts phone number', () => {
    const input = `John Doe
john@email.com
(555) 123-4567`;
    const result = parseCV(input);
    expect(result.contact.phone).toBe('(555) 123-4567');
  });

  it('extracts phone with international format', () => {
    const input = `John Doe
john@email.com
+1-555-123-4567`;
    const result = parseCV(input);
    expect(result.contact.phone).toBe('+1-555-123-4567');
  });

  it('extracts LinkedIn URL', () => {
    const input = `John Doe
john@email.com
linkedin.com/in/johndoe`;
    const result = parseCV(input);
    expect(result.contact.linkedin).toBe('linkedin.com/in/johndoe');
  });

  it('extracts LinkedIn URL with https', () => {
    const input = `John Doe
john@email.com
https://www.linkedin.com/in/johndoe/`;
    const result = parseCV(input);
    expect(result.contact.linkedin).toBe('https://www.linkedin.com/in/johndoe/');
  });

  it('extracts GitHub URL', () => {
    const input = `John Doe
github.com/johndoe`;
    const result = parseCV(input);
    expect(result.contact.github).toBe('github.com/johndoe');
  });

  it('extracts website URL', () => {
    const input = `John Doe
john@email.com
https://johndoe.com`;
    const result = parseCV(input);
    expect(result.contact.website).toBe('https://johndoe.com');
  });

  it('extracts location', () => {
    const input = `John Doe
San Francisco, California
john@email.com`;
    const result = parseCV(input);
    expect(result.contact.location).toBe('San Francisco, California');
  });

  it('stores additional links', () => {
    const input = `John Doe
john@email.com
https://portfolio.com
https://blog.johndoe.com`;
    const result = parseCV(input);
    expect(result.contact.website).toBe('https://portfolio.com');
    expect(result.contact.additionalLinks).toHaveLength(1);
    expect(result.contact.additionalLinks[0].url).toBe('https://blog.johndoe.com');
  });

  it('stops at section header', () => {
    const input = `John Doe
john@email.com

## Experience
Some content`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
    expect(result.experience).toBeDefined();
  });

  it('stops at separator line', () => {
    const input = `John Doe
john@email.com
---
## Experience`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
  });
});

// ============================================================================
// parseExperienceSection Tests
// ============================================================================

describe('parseExperienceSection', () => {
  it('parses entry with pipe separators', () => {
    const input = `John Doe

## Experience
**Software Engineer** | TechCorp Inc. | Jan 2022 - Present
- Built features`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].position).toBe('Software Engineer');
    expect(result.experience[0].company).toBe('TechCorp Inc.');
  });

  it('parses entry with em-dash separators', () => {
    const input = `John Doe

## Experience
**Software Engineer** — TechCorp Inc. — Jan 2022 - Present
- Built features`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].position).toBe('Software Engineer');
  });

  it('extracts date range with month and year', () => {
    const input = `John Doe

## Experience
Developer | Company | January 2020 - December 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience[0].dateRange).toBe('January 2020 - December 2022');
  });

  it('extracts date range with Present', () => {
    const input = `John Doe

## Experience
Developer | Company | Mar 2021 - Present
- Task`;
    const result = parseCV(input);
    expect(result.experience[0].dateRange).toBe('Mar 2021 - Present');
  });

  it('extracts year-only date range', () => {
    const input = `John Doe

## Experience
Developer | Company | 2020 - 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience[0].dateRange).toBe('2020 - 2022');
  });

  it('parses bullet points', () => {
    const input = `John Doe

## Experience
Developer | Company | 2020 - 2022
- Built REST APIs
- Implemented authentication
- Led team of 5`;
    const result = parseCV(input);
    expect(result.experience[0].bullets).toHaveLength(3);
    expect(result.experience[0].bullets[0]).toBe('Built REST APIs');
  });

  it('parses multiple entries', () => {
    const input = `John Doe

## Experience
Senior Developer | Company A | 2022 - Present
- Task 1

Junior Developer | Company B | 2020 - 2022
- Task 2`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(2);
    expect(result.experience[0].company).toBe('Company A');
    expect(result.experience[1].company).toBe('Company B');
  });

  it('handles BOLD 0 artifact', () => {
    const input = `John Doe

## Experience
BOLD 0 Developer | Company | 2020 - 2022
BOLD 0 Built features`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('preserves bold text in bullets', () => {
    const input = `John Doe

## Experience
Developer | Company | 2020 - 2022
- Achieved **50% improvement** in performance`;
    const result = parseCV(input);
    expect(result.experience[0].bullets[0]).toContain('**50% improvement**');
  });

  it('handles entries without location', () => {
    const input = `John Doe

## Experience
**Developer** | Remote Company | Jan 2022 - Present
- Remote work`;
    const result = parseCV(input);
    expect(result.experience[0].position).toBe('Developer');
    expect(result.experience[0].company).toBe('Remote Company');
  });
});

// ============================================================================
// parseEducationSection Tests
// ============================================================================

describe('parseEducationSection', () => {
  it('parses degree and institution', () => {
    const input = `John Doe

## Education
**BSc Computer Science** | University of Technology | 2016 - 2020`;
    const result = parseCV(input);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe('University of Technology');
    expect(result.education[0].degree).toBe('BSc Computer Science');
  });

  it('extracts date range', () => {
    const input = `John Doe

## Education
MSc Data Science | Tech University | Sept 2020 - Jun 2022`;
    const result = parseCV(input);
    expect(result.education[0].dateRange).toBe('Sept 2020 - Jun 2022');
  });

  it('extracts GPA information', () => {
    const input = `John Doe

## Education
BSc Computer Science | State University | 2016 - 2020
GPA: 3.8/4.0`;
    const result = parseCV(input);
    expect(result.education[0].details).toContain('GPA: 3.8/4.0');
  });

  it('handles multiple education entries', () => {
    const input = `John Doe

## Education
MBA | Business School | 2022 - 2024

BSc Engineering | Tech University | 2016 - 2020`;
    const result = parseCV(input);
    expect(result.education).toHaveLength(2);
  });

  it('recognizes education keywords', () => {
    const input = `John Doe

## Education
Ph.D in Physics | Princeton University | 2018 - 2023`;
    const result = parseCV(input);
    expect(result.education[0].institution).toBe('Princeton University');
  });

  it('handles entries with honors', () => {
    const input = `John Doe

## Education
Bachelor of Science | MIT | 2016 - 2020
First Class Honors`;
    const result = parseCV(input);
    expect(result.education[0].details.some(d => d.includes('First Class'))).toBe(true);
  });
});

// ============================================================================
// parseSkillsSection Tests
// ============================================================================

describe('parseSkillsSection', () => {
  it('parses category: skills format', () => {
    const input = `John Doe

## Skills
Languages: Python, JavaScript, TypeScript
Frameworks: React, Node.js, Django`;
    const result = parseCV(input);
    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].category).toBe('Languages');
    expect(result.skills[0].skills).toBe('Python, JavaScript, TypeScript');
  });

  it('parses **Category**: skills format', () => {
    const input = `John Doe

## Skills
**Programming**: Python, Java, C++
**Databases**: PostgreSQL, MongoDB`;
    const result = parseCV(input);
    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].category).toBe('Programming');
  });

  it('handles skills without category', () => {
    const input = `John Doe

## Skills
Python, JavaScript, React, Node.js`;
    const result = parseCV(input);
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].skills).toContain('Python');
  });

  it('handles multiple skill lines', () => {
    const input = `John Doe

## Skills
- Frontend: React, Vue, Angular
- Backend: Node.js, Python, Go
- DevOps: Docker, Kubernetes, AWS`;
    const result = parseCV(input);
    expect(result.skills.length).toBeGreaterThanOrEqual(3);
  });

  it('normalizes bullet markers', () => {
    const input = `John Doe

## Skills
• Languages: Python, JavaScript
* Frameworks: React, Django`;
    const result = parseCV(input);
    expect(result.skills.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// parseProjectsSection Tests
// ============================================================================

describe('parseProjectsSection', () => {
  it('extracts project name', () => {
    const input = `John Doe

## Projects
**Portfolio Website** (React, TypeScript) — 2023
- Built responsive portfolio`;
    const result = parseCV(input);
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].name).toContain('Portfolio Website');
  });

  it('extracts technology stack from parentheses', () => {
    const input = `John Doe

## Projects
**API Gateway** (Python, FastAPI, Docker) — 2023
- Built microservice`;
    const result = parseCV(input);
    expect(result.projects[0].technologies).toContain('Python');
    expect(result.projects[0].technologies).toContain('FastAPI');
  });

  it('extracts date/award info', () => {
    const input = `John Doe

## Projects
**Hackathon Project** (React, Node.js) — 1st Place, HackTech 2023
- Won hackathon`;
    const result = parseCV(input);
    expect(result.projects[0].dateRange).toContain('1st Place');
  });

  it('parses project bullets', () => {
    const input = `John Doe

## Projects
**ML Pipeline** (Python, PyTorch) — 2023
- Trained models with 95% accuracy
- Deployed to AWS
- Processed 1M records daily`;
    const result = parseCV(input);
    expect(result.projects[0].bullets).toHaveLength(3);
  });

  it('handles projects without tech stack', () => {
    const input = `John Doe

## Projects
**Open Source Contribution** — 2023
- Contributed to popular project`;
    const result = parseCV(input);
    expect(result.projects).toHaveLength(1);
  });

  it('recognizes various tech keywords', () => {
    const input = `John Doe

## Projects
**AI Chatbot** (Claude, LangChain, OpenAI) — 2024
- Built conversational AI`;
    const result = parseCV(input);
    expect(result.projects[0].technologies).toContain('Claude');
    expect(result.projects[0].technologies).toContain('LangChain');
  });

  it('handles multiple projects', () => {
    const input = `John Doe

## Projects
**Project A** (React) — 2023
- Task A

**Project B** (Python) — 2022
- Task B`;
    const result = parseCV(input);
    expect(result.projects).toHaveLength(2);
  });
});

// ============================================================================
// parseSimpleListSection Tests
// ============================================================================

describe('parseSimpleListSection', () => {
  it('parses bullet list items', () => {
    const input = `John Doe

## Certifications
- AWS Solutions Architect
- Google Cloud Professional
- Kubernetes Administrator`;
    const result = parseCV(input);
    expect(result.certifications).toHaveLength(3);
  });

  it('handles paragraph content', () => {
    const input = `John Doe

## Awards
**Best Innovation Award** Received for developing automated testing framework that reduced QA time by 60%.`;
    const result = parseCV(input);
    expect(result.awards).toHaveLength(1);
    expect(result.awards[0]).toContain('Best Innovation Award');
  });

  it('combines multi-line items', () => {
    const input = `John Doe

## Publications
**Machine Learning in Healthcare**
Published in Nature, 2023. Explored applications of ML in diagnostics.`;
    const result = parseCV(input);
    expect(result.publications.length).toBeGreaterThanOrEqual(1);
  });

  it('handles broken bold markers', () => {
    const input = `John Doe

## Awards
**Outstanding
Performance Award** for exceeding targets`;
    const result = parseCV(input);
    expect(result.awards.length).toBeGreaterThanOrEqual(1);
  });

  it('parses languages section', () => {
    const input = `John Doe

## Languages
- English (Native)
- Spanish (Professional)
- French (Basic)`;
    const result = parseCV(input);
    expect(result.languages).toHaveLength(3);
  });

  it('parses interests section', () => {
    const input = `John Doe

## Interests
- Open source development
- Machine learning research
- Technical writing`;
    const result = parseCV(input);
    expect(result.interests).toHaveLength(3);
  });
});

// ============================================================================
// parseCV Integration Tests
// ============================================================================

describe('parseCV integration', () => {
  it('parses complete CV', () => {
    const input = `# John Doe
john@email.com | 555-123-4567
San Francisco, CA
linkedin.com/in/johndoe | github.com/johndoe

## Summary
Experienced software engineer with 5+ years building scalable applications.

## Experience
**Senior Software Engineer** | TechCorp | Jan 2022 - Present
- Led development of microservices architecture
- Mentored team of 5 junior developers

**Software Engineer** | StartupXYZ | Jun 2019 - Dec 2021
- Built REST APIs serving 1M requests/day

## Education
**MSc Computer Science** | Stanford University | 2017 - 2019

## Skills
**Languages**: Python, JavaScript, TypeScript
**Frameworks**: React, Node.js, Django

## Projects
**Open Source Tool** (Python, Docker) — 2023
- 500+ GitHub stars

## Certifications
- AWS Solutions Architect Professional
- Google Cloud Professional`;

    const result = parseCV(input);

    expect(result.contact.name).toBe('John Doe');
    expect(result.contact.email).toBe('john@email.com');
    expect(result.contact.linkedin).toBe('linkedin.com/in/johndoe');
    expect(result.summary).toContain('Experienced software engineer');
    expect(result.experience).toHaveLength(2);
    expect(result.education).toHaveLength(1);
    expect(result.skills.length).toBeGreaterThanOrEqual(2);
    expect(result.projects).toHaveLength(1);
    expect(result.certifications).toHaveLength(2);
  });

  it('handles empty input', () => {
    const result = parseCV('');
    expect(result.contact.name).toBe('');
    expect(result.experience).toHaveLength(0);
  });

  it('handles input with only contact info', () => {
    const input = `John Doe
john@email.com
555-123-4567`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('John Doe');
    expect(result.contact.email).toBe('john@email.com');
    expect(result.experience).toHaveLength(0);
  });

  it('handles markdown headers (##)', () => {
    const input = `John
john@email.com

## Experience
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('handles ALL CAPS headers', () => {
    const input = `John
john@email.com

EXPERIENCE
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('handles bold headers (**Experience**)', () => {
    const input = `John
john@email.com

**Experience**
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('handles colon headers (Experience:)', () => {
    const input = `John
john@email.com

Experience:
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('maps section aliases correctly', () => {
    const input = `John
john@email.com

## Work History
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task

## Technical Skills
Languages: Python`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
    expect(result.skills.length).toBeGreaterThanOrEqual(1);
  });

  it('handles generic/unknown sections', () => {
    const input = `John

## Custom Section
- Item 1
- Item 2`;
    const result = parseCV(input);
    expect(result.genericSections).toHaveLength(1);
    expect(result.genericSections[0].title).toBe('Custom Section');
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================

describe('parser edge cases', () => {
  it('handles mixed bullet formats', () => {
    const input = `John
john@email.com

## Experience
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Bullet with dash
• Bullet with dot
* Bullet with asterisk`;
    const result = parseCV(input);
    expect(result.experience[0].bullets.length).toBeGreaterThanOrEqual(3);
  });

  it('handles em-dash vs hyphen correctly', () => {
    const input = `John

## Experience
**Full-Stack Developer** | Tech-Company Inc. | Jan 2020 — Present
- Built full-stack applications`;
    const result = parseCV(input);
    expect(result.experience[0].position).toContain('Full-Stack Developer');
  });

  it('handles Unicode characters', () => {
    const input = `José García
josé@email.com

## Experience
Desarrollador | Compañía Técnica | 2020 - 2022
- Trabajé en proyectos`;
    const result = parseCV(input);
    expect(result.contact.name).toBe('José García');
  });

  it('handles very long lines', () => {
    const longBullet = 'A'.repeat(500);
    const input = `John
john@email.com

## Experience
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- ${longBullet}`;
    const result = parseCV(input);
    expect(result.experience[0].bullets[0]).toHaveLength(500);
  });

  it('handles empty sections', () => {
    const input = `John

## Experience

## Education
BSc | University | 2020`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(0);
    expect(result.education).toHaveLength(1);
  });

  it('handles dates in various formats', () => {
    const input = `John

## Experience
Dev1 | Co1 | January 2020 - December 2022
- Task1

Dev2 | Co2 | 01/2020 - 12/2022
- Task2

Dev3 | Co3 | 2020 - 2022
- Task3`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(3);
  });

  it('handles consecutive separators', () => {
    const input = `John
john@email.com
---
---

## Experience
**Developer** | Company Inc. | Jan 2020 - Dec 2022
- Task`;
    const result = parseCV(input);
    expect(result.experience).toHaveLength(1);
  });

  it('preserves special LaTeX characters', () => {
    const input = `John

## Experience
Dev | Co & Partners | 2020 - 2022
- Improved performance by 50%
- Used C++ and C#`;
    const result = parseCV(input);
    expect(result.experience[0].company).toContain('&');
    expect(result.experience[0].bullets.some(b => b.includes('%'))).toBe(true);
  });
});
