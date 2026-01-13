# cv2latex

Convert your CV/resume from plain text or Markdown to professionally formatted LaTeX code.

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://tirth8205.github.io/CV2Latex/)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Live Demo

Try it now: **[https://tirth8205.github.io/CV2Latex/](https://tirth8205.github.io/CV2Latex/)**

## Features

- **Instant Conversion**: Paste your CV and get LaTeX code immediately
- **Markdown Support**: Use `**bold**` and `[links](url)` formatting
- **Professional Template**: Uses a clean, ATS-friendly resume template
- **100% Content Fidelity**: All your original content is preserved exactly
- **Syntax Highlighting**: LaTeX output is highlighted for easy reading
- **Copy & Download**: One-click copy to clipboard or download as `.tex` file
- **Dark Mode**: Toggle between light, dark, and system themes
- **Auto-Save**: Your input is automatically saved to local storage
- **File Upload**: Upload `.txt` or `.md` files directly
- **Sample CV**: Load a sample CV to see how it works
- **Keyboard Shortcut**: Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to convert
- **Parsing Feedback**: Get helpful tips and warnings about your CV structure

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
git clone https://github.com/tirth8205/CV2Latex.git

# Navigate to the project
cd CV2Latex

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
   - Or click **"Sample"** to load an example CV
   - Or click **"Upload"** to load a `.txt` or `.md` file
2. **Click "Convert to LaTeX"** button (or press `Ctrl+Enter`)
3. **Review** any parsing feedback or suggestions
4. **Copy or Download** the generated LaTeX code
5. **Compile** the `.tex` file using pdflatex or any LaTeX editor (Overleaf, TeXShop, etc.)

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

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Convert CV to LaTeX |

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
│   ├── hooks/            # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── utils/            # Core logic
│   │   ├── parser.ts     # CV parsing
│   │   ├── latexGenerator.ts
│   │   ├── escapeLatex.ts
│   │   └── template.ts   # LaTeX preamble
│   ├── data/
│   │   └── sampleCV.ts   # Sample CV content
│   ├── types/
│   │   └── cv.ts         # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions deployment
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the `main` branch triggers a new deployment.

To deploy your own fork:
1. Fork this repository
2. Go to repository Settings > Pages
3. Under "Build and deployment", select "GitHub Actions"
4. Push any change to trigger deployment

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

