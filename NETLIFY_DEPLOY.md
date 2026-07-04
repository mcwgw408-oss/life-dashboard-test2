# Netlify Deploy Guide

## Build dist

Install dependencies, then create the production build.

```powershell
npm.cmd install
npm.cmd run build
```

After a successful build, Vite creates the `dist` folder. For a manual Netlify deploy, upload the `dist` folder itself.

To preview the production build locally:

```powershell
npm.cmd run preview
```

## Upload to Netlify

1. Log in to Netlify.
2. Open `Sites`, then choose `Add new site`.
3. For a manual deploy, choose `Deploy manually` and drag the `dist` folder into Netlify.
4. For a Git-based deploy, connect the repository and use these build settings:

```text
Build command: npm run build
Publish directory: dist
```

The repository includes `netlify.toml`, so Netlify can read the same settings automatically.

## Embed in Notion

1. Open the Netlify site URL and confirm it loads over HTTPS.
2. In a Notion page, type `/embed`.
3. Paste the Netlify URL.
4. Resize the embed block height.

Tasks are saved in browser `localStorage`. They persist in the same browser, including inside Notion, but they do not sync across devices or browsers.
