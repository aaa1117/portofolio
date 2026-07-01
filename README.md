# Ayman Bilal — Portfolio

A single-page "SOC analyst console" portfolio: boot sequence, live (simulated)
log feed, interactive terminal, and projects presented as case files. Plain
HTML, CSS, and JavaScript — no build step, no dependencies, no trackers.

```
index.html      → markup & content
styles.css      → SOC console theme
script.js       → boot sequence, clocks, log feed, terminal, scroll reveals
assets/
  resume.pdf    → downloadable CV
  favicon.svg   → site icon
```

## Run locally

Just open the file:

```bash
xdg-open index.html      # Linux
```

Or serve it (recommended, so paths behave like production):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

This is a **user site**, so it goes live at `https://aaa1117.github.io`.

1. Create a new GitHub repo named exactly **`aaa1117.github.io`** (public).
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/aaa1117/aaa1117.github.io.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Wait ~1 minute, then open **https://aaa1117.github.io**.

> Prefer a project page instead? Name the repo anything (e.g. `portfolio`),
> push, enable Pages the same way, and it'll be served at
> `https://aaa1117.github.io/portfolio/`.

## Editing your content

- **Text / sections** → `index.html`
- **Colors / spacing** → the `:root` variables at the top of `styles.css`
- **Project repo links** → currently all point to `github.com/aaa1117`; swap in
  specific repo URLs once they're public.
- **Replace the CV** → overwrite `assets/resume.pdf`.
