import type { TemplateConfig } from './index';
import type { SectionType } from '../types/cv';

const preamble = `\\documentclass[letterpaper,10pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontenc}
\\usepackage{helvet}
\\usepackage{ragged2e}
\\input{glyphtounicode}

% Use sans-serif font
\\renewcommand{\\familydefault}{\\sfdefault}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Tighter margins for modern look
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Modern section formatting with color accent
\\titleformat{\\section}{
  \\vspace{-6pt}\\color{MidnightBlue}\\bfseries\\raggedright\\large
}{}{0em}{}[\\vspace{-4pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textcolor{gray}{#2} \\\\
      \\small#3 & \\small\\textcolor{gray}{#4} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\small\\textcolor{gray}{#2} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textcolor{gray}{#2} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{\\textcolor{MidnightBlue}{$\\bullet$}}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-4pt}}

\\begin{document}

`;

const documentEnd = `
\\end{document}`;

const defaultSectionOrder: SectionType[] = [
  'summary',
  'experience',
  'skills',
  'projects',
  'education',
  'certifications',
  'awards',
  'publications',
  'languages',
  'interests',
];

export const modernTemplate: TemplateConfig = {
  id: 'modern',
  name: 'Modern',
  description: 'Contemporary sans-serif design with subtle color accents',
  preamble,
  documentEnd,
  defaultSectionOrder,
};
