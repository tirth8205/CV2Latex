# cv2latex

Convert your CV/resume from plain text or Markdown to professionally formatted LaTeX code.

![cv2latex Screenshot](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Instant Conversion**: Paste your CV and get LaTeX code immediately
- **Markdown Support**: Use `**bold**` and `[links](url)` formatting
- **Professional Template**: Uses a clean, ATS-friendly resume template
- **100% Content Fidelity**: All your original content is preserved exactly
- **Syntax Highlighting**: LaTeX output is highlighted for easy reading
- **Copy & Download**: One-click copy to clipboard or download as `.tex` file

## Supported Sections

- Contact Information (name, email, phone, LinkedIn, GitHub, website)
- Professional Summary
- Technical Skills
- Professional Experience
- Industry Projects
- Education
- Achievements/Awards
- Certifications
- Publications
- Languages
- Interests

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tirth8205/cv2latex.git

# Navigate to the project
cd cv2latex

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Paste your CV** in the left panel (plain text or Markdown format)
2. **Click "Convert to LaTeX"** button
3. **Copy or Download** the generated LaTeX code
4. **Compile** the `.tex` file using pdflatex or any LaTeX editor (Overleaf, TeXShop, etc.)

### Input Format Example

```markdown
# John Doe
New York, NY | john@email.com | linkedin.com/in/johndoe | github.com/johndoe

## Professional Summary
Experienced software engineer with 5+ years of experience building scalable web applications.

## Technical Skills
**Languages**: Python, JavaScript, TypeScript, Go
**Frameworks**: React, Node.js, Django, FastAPI
**Cloud**: AWS, Docker, Kubernetes

## Professional Experience
**Senior Software Engineer** | Tech Company Inc. | Jan 2022 - Present
- Led development of microservices architecture serving 1M+ users
- **Reduced latency by 40%** through optimization initiatives
- Mentored team of 5 junior developers

## Education
**MSc Computer Science** | Stanford University | 2019 - 2021
Grade: Distinction

## Achievements
**Employee of the Year 2023**
Recognized for exceptional contributions to the platform redesign project.
```

### Bold Text in Output

To get bold text in your LaTeX output, use `**double asterisks**` in your input:

```
- I **designed and built** a system that **improved performance by 50%**
```

Becomes:

```latex
\resumeItem{I \textbf{designed and built} a system that \textbf{improved performance by 50\%}}
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Prism.js** - Syntax highlighting

## LaTeX Template

The generated LaTeX uses a professional resume template with custom commands:

- `\resumeSubheading{Company}{Date}{Position}{Location}`
- `\resumeItem{Description}`
- `\resumeProjectHeading{Project Details}{}`

The template is ATS-friendly and compiles with standard pdflatex.

## Project Structure

```
cv2latex/
├── src/
│   ├── components/       # React components
│   │   ├── InputPanel.tsx
│   │   └── OutputPanel.tsx
│   ├── utils/           # Core logic
│   │   ├── parser.ts    # CV parsing
│   │   ├── latexGenerator.ts
│   │   ├── escapeLatex.ts
│   │   └── template.ts  # LaTeX preamble
│   ├── types/
│   │   └── cv.ts        # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- LaTeX resume template inspired by [Jake's Resume](https://github.com/jakegut/resume)
- Built with React and Vite
