# Deployment checklist

## GitHub Pages
1. Create a repository and upload the contents of this folder to its root.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Wait for the Pages build and open the URL shown in Settings → Pages.

## Netlify / Cloudflare Pages
- Create a new static-site project and connect the repository, or drag this folder into the provider's manual deploy UI.
- Build command: none.
- Publish directory: the folder containing `index.html`.

## Pre-launch checks
- Test at desktop, tablet and mobile widths.
- Test project dialogs, the mobile menu, CV download, email copy, and external profile links.
- Confirm the PDF is the intended public résumé.
- Add a custom domain and update the Open Graph/canonical metadata if needed.
- Verify external font and Three.js CDN loading under your target network policy.
