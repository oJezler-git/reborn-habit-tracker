# Report Overview

To view the report, open `public.pdf`.

The source is written in LaTeX (`main.tex`), chosen for its ability to:

- Typeset complex mathematical equations with precision
- Automatically manage formatting elements such as tables of contents, numbering, and bibliographies
- Separate content from design, for high-quality, professional output

The report was initially developed using [Overleaf](https://overleaf.com/), but due to compilation limits, development switched to [Visual Studio Code](https://code.visualstudio.com/) with the [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) extension.

Note: LaTeX was not learned specifically for this report; I had prior experience.

---

# Building and Editing the Report

If you want to modify the report or explore its structure:

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) extension
- [MiKTeX](https://miktex.org/) or TeX Live distribution
- [Strawberry Perl](https://strawberryperl.com/) (for Windows users)

## Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/oJezler-git/reborn-habit-tracker.git
cd reborn-habit-tracker/report
```

Once installed, editing `main.tex` and saving it will trigger the build process.

## Project Structure

```
reborn-habit-tracker/
├── report/
│   ├── images/               # Images used in the report
│   ├── main.tex              # Main document (edit this)
│   ├── main-private.tex      # Private build wrapper (do not edit)
│   ├── public.tex            # Redacted placeholder data
│   ├── personal.tex          # Your actual personal data (gitignored)
│   ├── personal.example.tex  # Template for personal.tex
│   └── references.bib        # Bibliography with references
├── .gitignore                # Excludes personal.tex and private.pdf
└── .vscode/
    └── settings.json         # LaTeX Workshop configuration
```

---

# Private & Public Build Workflow

This section explains how to set up a workflow that separates **private builds** (with real personal data) from **public builds** (with redacted data).

## 1. Create Template Files

### `main-private.tex` (Private build entry point)

```tex
\def\PRIVATEBUILD{}
\input{main}
```

### `public.tex` (Redacted data)

```tex
\newcommand{\StudentName}{REDACTED}
\newcommand{\CandidateNumber}{XXXX}
\newcommand{\CentreNumber}{XXXXX}
\newcommand{\SchoolName}{REDACTED}
```

### `personal.example.tex` (Template for contributors)

```tex
% This file should NOT be included in public builds
% Copy this to personal.tex and replace with your actual information

\ifdefined\public
  \errmessage{ERROR: personal.tex included in PUBLIC build}
\fi

\newcommand{\StudentName}{Your Full Name}
\newcommand{\CandidateNumber}{Your Candidate Number}
\newcommand{\CentreNumber}{Your Centre Number}
\newcommand{\SchoolName}{Your School Name}
```

### `.gitignore`

```
# Exclude personal information
personal.tex
private.pdf

# Standard LaTeX artifacts
*.aux
*.log
*.out
*.toc
*.synctex.gz
*.fdb_latexmk
*.fls
```

---

## 2. Configure VS Code

`.vscode/settings.json`:

```json
{
  // -----------------------
  // Tools (individual commands)
  // -----------------------
  "latex-workshop.latex.tools": [
    {
      // pdflatex command for public (redacted) build
      "name": "pdflatex-public",
      "command": "pdflatex",
      "args": [
        "-synctex=1", // enable SyncTeX for forward/inverse search
        "-interaction=nonstopmode", // keep compiling even if errors occur
        "-file-line-error", // show errors with file:line
        "-jobname=public", // output PDF will be public.pdf
        "%DOC%" // input file (main.tex)
      ]
    },
    {
      // biber command for public build
      "name": "biber-public",
      "command": "biber",
      "args": [
        "public" // must match the -jobname above
      ]
    },
    {
      // pdflatex command for private (full) build
      "name": "pdflatex-private",
      "command": "pdflatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "main-private.tex" // entry point for private build
      ]
    },
    {
      // biber command for private build
      "name": "biber-private",
      "command": "biber",
      "args": [
        "main-private" // matches the private entry point
      ]
    }
  ],

  // -----------------------
  // Recipes (sequence of tools)
  // -----------------------
  "latex-workshop.latex.recipes": [
    {
      // Public PDF recipe (redacted)
      "name": "Public PDF (redacted)",
      "tools": [
        "pdflatex-public",
        "biber-public",
        "pdflatex-public",
        "pdflatex-public"
      ]
    },
    {
      // Private PDF recipe (full personal info)
      "name": "Private PDF (full)",
      "tools": [
        "pdflatex-private",
        "biber-private",
        "pdflatex-private",
        "pdflatex-private"
      ]
    }
  ],

  // -----------------------
  // Auto-build and viewer settings
  // -----------------------
  "latex-workshop.latex.autoBuild.run": "onSave", // compile automatically when saving
  "latex-workshop.latex.recipe.default": "first", // use the first recipe by default
  "latex-workshop.latex.outDir": "./", // output directory for auxiliary files
  "latex-workshop.view.pdf.viewer": "tab", // VS Code PDF viewer

  // -----------------------
  // SyncTeX settings for forward/inverse search
  // -----------------------
  "latex-workshop.synctex.synctexjs.enabled": true // enable SyncTeX using JavaScript
}
```

---

## 3. Update Main Document

Add the following at the top of `main.tex` (before `\documentclass`):

```tex
\newif\ifpublic

% Default to public for safety
\publictrue

% Override via private build
\ifdefined\PRIVATEBUILD
  \publicfalse
\fi

\ifpublic
  \def\public{}
  \input{public.tex}   % Redacted data
\else
  \input{personal.tex} % Full personal data
\fi
```

Force output to public.pdf for auto-builds and forward/inverse sync by adding this line to the very top of the `main.tex` file:

```tex
% !TEX jobname = public
```

Use the commands throughout the document:

```tex
\StudentName
\CandidateNumber
\CentreNumber
\SchoolName
```

---

# Usage

### Contributor Setup

1. Clone the repository
2. Copy the template: `cp personal.example.tex personal.tex`
3. Edit `personal.tex` with actual data
4. **Do not commit** `personal.tex` to version control

### Building Documents

#### Automatic Public Build

- Save `main.tex` (`Ctrl+S`)
- Output: `public.pdf` (redacted)

#### Manual Private Build

1. Open Command Palette (`Ctrl+Shift+P`)
2. Select: `LaTeX Workshop: Build LaTeX project`
3. Choose: **Private PDF (full)**
4. Output: `private.pdf` (full personal data)

---

# Safety Features

1. **Default-safe**: Auto-builds generate only redacted output
2. **Build-time validation**: `personal.tex` triggers an error if included in a public build
3. **Git protection**: `.gitignore` prevents accidental commits of sensitive files
4. **Explicit private builds**: Manual selection ensures private data is never auto-published

---

# Troubleshooting

### "File personal.tex not found"

- **Cause**: Personal data file missing
- **Fix**: Copy template and edit

```bash
cp personal.example.tex personal.tex
```

### Private build still shows redacted data

- **Cause**: `\PRIVATEBUILD` flag not recognised
- **Fix**:

  - Confirm `main-private.tex` contains `\def\PRIVATEBUILD{}`
  - Use the "Private PDF (full)" recipe
  - Ensure conditional logic in `main.tex` is before `\documentclass`

### "ERROR: personal.tex included in PUBLIC build"

- **Cause**: Safety check triggered
- **Action**: Review build configuration to ensure public builds use `public.tex`

---

# Contributing

1. **Do not commit** `personal.tex` or `private.pdf`
2. **Do commit** `personal.example.tex`
3. Test both builds before submitting PRs
4. Update the example template if new personal fields are added
