import type { TemplateConfig } from './index';
import type { SectionType } from '../types/cv';

const preamble = `\\documentclass[letterpaper,12pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{palatino}
\\usepackage{ragged2e}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Standard academic margins (1 inch)
\\addtolength{\\oddsidemargin}{0in}
\\addtolength{\\evensidemargin}{0in}
\\addtolength{\\textwidth}{0in}
\\addtolength{\\topmargin}{-.3in}
\\addtolength{\\textheight}{0.6in}

\\urlstyle{same}
\\raggedbottom
\\setlength{\\tabcolsep}{0in}

% Academic section formatting with small caps
\\titleformat{\\section}{
  \\vspace{-2pt}\\scshape\\raggedright\\Large
}{}{0em}{}[\\vspace{-2pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\normalsize{
    {#1 \\vspace{-1pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{0pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{#3} & \\textit{#4} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{#1} & \\textit{#2} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & #2 \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-2pt}}
\\renewcommand\\labelitemii{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.2in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-2pt}}

\\begin{document}

`;

const documentEnd = `
\\end{document}`;

const defaultSectionOrder: SectionType[] = [
  'summary',
  'education',
  'experience',
  'publications',
  'projects',
  'skills',
  'awards',
  'certifications',
  'languages',
  'interests',
];

export const academicTemplate: TemplateConfig = {
  id: 'academic',
  name: 'Academic',
  description: 'Traditional academic CV with Palatino font and wider margins',
  preamble,
  documentEnd,
  defaultSectionOrder,
};
