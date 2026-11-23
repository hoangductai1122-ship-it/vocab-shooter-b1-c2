# Project Workflow Rules

## Review Before Commit & Push
- After editing code, styles, or data files, **do NOT run `git commit` or `git push` automatically** unless the user explicitly asks to commit or deploy in that same request.
- Leave changes unstaged/uncommitted in the working tree so the user can:
  1. Inspect line-by-line diffs directly in Source Control (`Ctrl + Shift + G`).
  2. Preview and test changes locally (e.g., by opening `index.html`).
- Always provide a concise summary of modified files and key changes, then wait for the user's explicit confirmation (e.g., "OK, push lên web") before running `git commit` and `git push`.
