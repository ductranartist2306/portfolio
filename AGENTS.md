# Repository Rules

## GitHub Pages deployment

- GitHub Pages must use **GitHub Actions** as its publishing source. Do not use **Deploy from a branch**: that mode serves the Vite source `index.html` and leaves the portfolio blank.
- A successful `deploy-pages` action is not enough. The workflow must verify that the live page references `/portfolio/assets/` and never `/src/main.tsx`.
- Changing the Pages publishing source requires repository-admin access. A contributor with only push access must ask the repository owner to make that setting change.
