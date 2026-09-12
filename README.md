# Hub Carbon — GitHub Pages Website V1

A static, responsive website prototype for Hub Carbon.

## Structure

- `index.html` — homepage
- `pages/` — internal hub pages
- `css/style.css` — design system and responsive layout
- `js/main.js` — navigation + reveal animations
- `assets/` — brand assets
- `CNAME` — custom domain target (`www.hubcarbon.com`)
- `robots.txt` / `sitemap.xml` — basic SEO files

## Brand direction

- Deep green: `#0B3D2E`
- Charcoal: `#102019`
- Paper: `#F6F7F3`
- Sage accents
- Inter typography
- Core positioning: **Connecting the low-carbon economy.**

The supplied Hub Carbon mark has been incorporated as a digital asset. The site uses the mark as a distinctive brand asset while avoiding generic sustainability imagery.

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `hub-carbon`.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under the publishing source, select the `main` branch and `/ (root)`.
5. Set the custom domain to `www.hubcarbon.com`.
6. At the DNS provider, point `www` to your GitHub Pages hostname:
   `YOUR-GITHUB-USERNAME.github.io`
7. Configure the apex `hubcarbon.com` with GitHub Pages A/AAAA records if you want the root domain to work directly.
8. Return to GitHub Pages and enable **Enforce HTTPS** once GitHub makes it available.

Do not change the existing DNS until the new GitHub site has been tested on its `github.io` address.

## Important

Replace `YOUR-GITHUB-USERNAME` in the DNS instructions with the actual GitHub username.

The current CNAME file is set to `www.hubcarbon.com`. This does not change DNS by itself.

## Next development steps

- Replace placeholder contact route with the preferred business contact channel.
- Add final favicon/OG image.
- Add analytics only after the measurement requirements are defined.
- Build the five hub pages into substantive service/product pages.
- Add a project explorer / intelligence layer when the underlying data model is ready.
