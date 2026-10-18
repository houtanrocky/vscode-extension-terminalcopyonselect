# Discoverability and publication

The public website is `https://houtanrocky.github.io/vscode-extension-terminalcopyonselect/`. The setup guide, support page, and privacy page each have a distinct title, description, canonical URL, social metadata, and crawlable content rendered as static HTML.

The home page includes truthful SoftwareApplication structured data with a free Offer. Breadcrumb structured data follows the page hierarchy. There are no invented ratings, download numbers, or testimonials. Software structured data does not guarantee a search rich result, and search engines decide indexing and rankings.

## GitHub Pages

Choose **GitHub Actions** in Settings → Pages. The Pages workflow builds and validates the site without installing dependencies, uploads `site-dist`, and deploys pushes to `main`. For local checks, run `pnpm site:check` and `pnpm site:preview`.

GitHub Pages project sites use an account-level robots policy: the project’s `robots.txt` is not at the origin root. The sitemap is also linked here and can be submitted directly in a verified search console property:

`https://houtanrocky.github.io/vscode-extension-terminalcopyonselect/sitemap.xml`

## Search engines

1. Add the exact project-site URL as a URL-prefix property in Google Search Console. Verify ownership with the HTML-file or HTML-tag method offered for your account. Add the verification file to `website/assets/` and update the build to copy it to the root, or add the account-specific meta tag to the shared head. Do not invent verification tokens.
2. Submit `sitemap.xml` in that verified property and request inspection of the home, guide, and support URLs.
3. Add the site to Bing Webmaster Tools, or import the verified Search Console property.
4. Review indexing and actual search queries before changing content. Keep guides useful and specific rather than adding near-duplicate keyword pages.

Search Console and Bing submissions require the owner’s accounts. They are not performed by a code deployment. GitHub Pages project sites cannot control the account-root `robots.txt`; a custom domain would give you origin-level control if needed later.

## Marketplace and repository

The extension ID is `HoutanRocky.terminal-copy-on-select`; the GitHub owner is `houtanrocky`. Keep the publisher identifier unchanged when releasing an update. The manifest links to the project website and support page, and the README supplies installation steps, useful keywords in context, a social preview, privacy details, and troubleshooting.

After reviewing and testing the extension, bump its version, move the Unreleased changelog into that version, and push the corresponding version tag. Configure `VSCE_PAT` and `OVSX_PAT` in repository Actions secrets to publish through the release workflow. Deploying the website does not publish a new Marketplace version.

At implementation time, the Marketplace listing exists, but no Open VSX listing or repository publishing secrets were found. Create the matching `HoutanRocky` namespace and add `OVSX_PAT` before the first Open VSX publication. Add a public Open VSX install link only after its listing is live. Add `VSCE_PAT` for automated Marketplace updates.

Use an accurate repository description, project-site homepage, and focused topics. An owner may also upload `website/assets/social-card.png` under repository Settings → General → Social preview; GitHub does not expose this setting through the repository metadata API.

## Sharing

Link to the setup guide when answering relevant questions, and to a specific support answer when troubleshooting. A short screen recording of real terminal selection is suitable for a Marketplace gallery or release announcement. Request honest reviews from users; avoid paid ratings, link spam, or claims about guaranteed search placement.

Technical references: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [software application structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [VS Code publishing extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
