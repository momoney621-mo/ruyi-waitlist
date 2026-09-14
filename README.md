# The Ruyi waitlist site

A static, dependency-free marketing page for Ruyi. No build step, no npm
install, no framework — plain HTML, four stylesheets, and ES modules. Signups
go straight to a Supabase table over its REST endpoint. Open it from any static
server and it runs.

```bash
node serve.mjs                  # http://localhost:4173
node serve.mjs 5000             # …on another port
```

`serve.mjs` is Node's own http and fs and nothing else, so this works on a
fresh clone with no `npm install`. Any other static server does the same job:

```bash
python3 -m http.server 4173
npx serve .
```

Opening `index.html` as a `file://` URL will not work — the page uses ES
modules, which browsers refuse to load over `file:`.

## Before you publish

Three of these are legal obligations, not polish. Work through all five.

1. **Fill in `scripts/config.js`.** Until you do, the page prints
   `not set — see scripts/config.js` wherever a required detail belongs. That
   is deliberate: a privacy policy with no contact address, or a marketing
   email with no postal address, is worse than none.
2. **Create the Supabase table** (below) and paste the project URL and
   publishable key into the same file.
3. **Read `privacy.html`, `terms.html` and `accessibility.html` line by line.**
   They are written for this site as it stands, and they will stop being true
   the moment you add analytics, a newsletter tool, or a second data field.
   They are a solid starting point, not legal advice — if real money or real
   risk is involved, have a lawyer read them.
4. **Point the DNS and serve over HTTPS.** Any static host does: Cloudflare
   Pages, Netlify, Vercel, GitHub Pages.
5. **Get a postal address you are willing to publish.** A registered PO box or
   a private mailbox is fine, and US anti-spam law requires one in every
   marketing email you send.

## Wiring the waitlist to Supabase

1. Create a project at [supabase.com](https://supabase.com). The free tier is
   more than enough for a waitlist.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and run
   it. That creates the table, switches on row-level security, and grants the
   public role exactly one privilege: appending a row.
3. Open **Project Settings → API keys** and copy the **project URL** and the
   **publishable** key (`sb_publishable_…`, previously called `anon`).
4. Put both in `scripts/config.js`.

```js
export const SUPABASE_URL = "https://abcdefgh.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_…";
```

**The publishable key belongs in the page.** It is designed to be public and
can only do what row-level security allows, which here is one INSERT. The
**secret** key (`sb_secret_…`, previously `service_role`) bypasses row-level
security entirely and must never appear in this directory.

Two details worth knowing if you change the code:

- The request sends `Prefer: return=minimal`. Without it PostgREST runs
  `INSERT … RETURNING`, Postgres then evaluates a SELECT policy that
  deliberately does not exist, and every signup fails with a row-level security
  error.
- A repeat address comes back as HTTP 409 from the unique index, which the page
  treats as "you are already on the list" rather than an error.

Read the list in the Supabase table editor, or export it to CSV from there.

With no project configured the form still works and keeps the signup in the
browser only, so the page can be demonstrated without pretending a request
succeeded.

## Deploying

There is nothing to build, so any static host works. Point it at this
directory, leave the build command empty, and serve over HTTPS:

- **Cloudflare Pages** or **Netlify** or **Vercel** — connect the repository,
  no build command, output directory is the repository root.
- **GitHub Pages** — Settings → Pages → deploy from a branch, folder `/`.

## What is here

| | |
|---|---|
| `index.html` | The whole page. Every chapter's copy lives in the markup, so the page reads with JavaScript off. |
| `privacy.html`, `terms.html`, `accessibility.html` | The policy pages the footer links to. |
| `styles/base.css` | The ink scale, the type scale, buttons, reveals. One colour channel: white at a stated opacity over near-black. |
| `styles/layout.css` | The fixed cloud field, the chrome, the editorial grid, and the footer small print. |
| `styles/components.css` | The waitlist form and three product illustrations. |
| `styles/legal.css` | The policy pages. |
| `scripts/config.js` | Supabase project, operator details, consent wording. The only file a deployment must edit. |
| `scripts/clouds.js` | The cloud motifs moving at separate scroll and pointer-parallax depths. |
| `scripts/reveal.js` | Reveals, the chapter rail, and the progress hairline. |
| `scripts/waitlist.js` | Validation and the Supabase insert. |
| `scripts/legal.js` | Writes the operator's details into every page that has to name them. |
| `supabase/schema.sql` | The table, its constraints, and its one policy. Safe to re-run. |
| `assets/clouds/` | Nine transparent crops extracted from the supplied cloud artwork. |

## What the page discloses, and why

Each of these answers a specific rule, and removing one removes the protection:

- **A notice at the form itself**, naming what is collected and why, with links
  to the policies. California requires the notice *at or before* collection —
  a privacy policy a visitor has to go and find does not satisfy it on its own.
- **An unticked box** for optional product updates, separate from the signup.
  Under UK/EU rules marketing consent must be an affirmative act and must not
  be bundled with anything else. The exact sentence shown is stored with the
  row, so the consent record is evidence rather than a reconstruction.
- **A stated minimum age of 16**, which clears the US children's-privacy
  threshold of 13 and the highest EU digital-consent age.
- **A postal address and a real contact address** in the footer. US anti-spam
  law requires the postal address in commercial email, and privacy law requires
  a route for access and deletion requests.
- **"We do not sell or share"**, stated plainly. It is true of this page, and
  saying so is what removes the need for a "Do Not Sell" mechanism.
- **An accessibility statement with a monitored contact**, which is the
  cheapest meaningful defence against the most common category of website
  lawsuit. The page targets WCAG 2.2 AA.
- **A beta disclaimer** that the illustrations are illustrations. The figures
  and quotes on the page are examples, and the page says so rather than letting
  a reader take them for measurements.

## Notes

- Fonts are Newsreader, Instrument Sans and IBM Plex Mono from Google Fonts,
  with system fallbacks in the stack. The brand's two characters load as a
  `text=`-subset of Noto Serif SC, so the request is a few hundred bytes. Your
  visitors' browsers therefore fetch files from Google; the privacy policy says
  so. Self-host the files if you would rather they did not.
- `prefers-reduced-motion` stops the cloud drift, the reveals and the grain.
- The cloud field is ordinary images rather than WebGL, so it stays sharp and
  needs no graphics fallback.
- The form carries a honeypot field; a submission that fills it is dropped
  without a request. Supabase does not rate-limit inserts for you, so if the
  page is ever targeted, put it behind a host that can.

## Where this came from, and how to give it its own remote

This repository is the `site/` directory of the Ruyi application repository,
extracted to its own root so the page can be deployed on its own schedule. It
shares no code with the app: nothing here imports from it, and nothing in it
imports from here.

The history starts at the extraction. To publish it, create an empty repository
on GitHub — no README, no licence, no `.gitignore` — and then:

```bash
git remote set-url origin https://github.com/<you>/<new-repo>.git
git push -u origin HEAD:main
```

## Licence

All rights reserved. This is the marketing site for a paid, closed-source
product; it is published here to be deployed, not to be reused.
# ruyi-waitlist
