# ARTIFICE — website editing guide

Live website: https://www.artificepractice.com/

Built as static HTML, CSS and JavaScript, hosted on GitHub Pages. **No build command, Node, React, account or Supabase installation is required to edit the existing Atlas records.**

## Where to change things

| File | What you can change |
| --- | --- |
| `index.html` | Homepage and manifesto |
| `about.html` | People, location and podcast |
| `projects.html`, `projects.js` | Maine–Montparnasse project and its image captions |
| `contact.html` | Contact details |
| `styles.css` | Global site style, menus, homepage, project layouts |
| **`atlas-data.js`** | **All initial Atlas places, coordinates, categories and tags** |
| **`atlas.html`** | **Atlas title, layout, filter labels and map controls** |
| `atlas.js` | MapLibre map initialization, filtering, UI and submission logic |
| `atlas.css` | Map visual details, page spacing, markers, filters, mobile rules |
| `atlas-place.html`, `atlas-place.js` | Place detail pages |
| `atlas-config.js` | Optional public backend configuration only |
| `assets/` | Images, videos and audio |

The `atlas-preview/` directory is an **older testing copy**, not the current live Atlas. Do not edit it to change the main site.

## Add a place

1. Open `atlas-data.js` on GitHub and click the pencil icon.
2. Add an object inside `seedPlaces` and separate it with a comma.
3. Copy the fields from another entry. Use a unique **id** (lowercase, hyphenated), and `coordinates: [longitude, latitude]`, not latitude/longitude.
4. Give it exactly **one category** from `CATEGORIES`, and multiple tags in `tags: ["retail", "subculture"]` as appropriate. Dates should be verified, or left as an empty string.
5. Add a description and optionally `project: "projects.html"` for a related ARTIFICE project.
6. Commit the change, then wait for GitHub Pages deployment. The index, map, filters and record page update automatically.

Example:
```js
{
  id: "example-place",
  name: "Example Place",
  city: "Tokyo",
  country: "Japan",
  year: "1985",
  coordinates: [139.70, 35.68],
  category: "cinema-complex",
  tags: ["retail", "subculture"],
  description: "A short factual description."
}
```

## Categories vs. tags

**Category** = architectural typology, **one per place**. Use `shopping-mall` for multi-tenant shopping centres, `department-store` for a department store, `electronics-complex` for an electronics-market building, and `mixed-use-complex` for buildings combining uses. Extend `CATEGORIES` if necessary.

**Tags** = research themes, **multiple per place**, e.g. `consumerism`, `adaptive-reuse`, `retail`. To add a pretty display name, edit `TAG_LABELS`. Tags automatically appear in the filters when at least one place uses them. Filter selections are encoded in the URL for sharing.

## Adjust the appearance

- Large gap beneath the top menu: `.atlas-page .atlas-main` in `atlas.css`.
- Map height: `.atlas-stage` in `atlas.css`.
- Marker circle colour/size: `.atlas-marker` and `.atlas-proposal-pin` in `atlas.css`.
- Category/tag chip styles: `.atlas-filter-chip`.
- Mobile layout: `@media(max-width:780px)` at the end of `atlas.css`.
- Black-and-white map layers: `configureBlackWhite()` in `atlas.js`. The map uses MapLibre GL JS 5.6.0 and OpenFreeMap OSM-derived vector tiles. Keep map glyphs/style settings intact: font experiments have previously caused rendering failures.

## What is / is not active

- The six curated places are stored in `atlas-data.js` and are public.
- The **Propose a place** form is an interface mock-up unless a moderated backend is configured in `atlas-config.js`. Do not put private Supabase keys in GitHub.
- Adding places through an authenticated in-site admin panel still requires backend integration. Public suggestions need moderation and anti-spam protections.
- Coordinates and dates in the initial records need individual source verification.
- Avoid using copyrighted map fonts or assets without permission.

## Publish safely

Use a new Git branch for major changes and a GitHub Pull Request to review them. GitHub Pages publishes the `main` branch. You can see deployment status under **Actions → pages build and deployment**. If you see an outdated page after a deploy, try a hard refresh (Cmd + Shift + R).

Never edit generated Git blobs manually, upload private credentials, or copy experimental changes over the stable live map without testing.

## Project ↔ Atlas connection

The small red pin and **Paris, France** in `projects.html` links to `atlas.html?place=maine-montparnasse`. The Atlas checks the `place` URL parameter and centers the map on the matching `id` in `atlas-data.js`. To use this for future projects, change the ID in the link to a different Atlas record.

**Important marker alignment:** CSS must not override MapLibre's `position:absolute` on the `.maplibregl-marker` elements. The marker styling in `atlas.css` intentionally avoids `position:relative`. Keep coordinates in `atlas-data.js` as `[longitude, latitude]`.

The reduced project-page top spacing is defined by `.projects-page .project-content` in `styles.css`, including its mobile override.

## Email-based Atlas proposals (active workflow)

Visitors can propose a place directly from `atlas.html`. Clicking **Propose a place** opens a form; selecting a position on the map provides WGS84 latitude and longitude. The visitor completes the record and clicks **Open email to send**.

The website opens a prepared email draft addressed to **contact@artificepractice.com**, including place name, city, country, year, category, tags, description, reference and a link to the exact point in OpenStreetMap.

**Important:** A `mailto:` link prepares an email in the visitor's configured email application. It does **not** automatically send an email, store the proposal or confirm that ARTIFICE received anything. The visitor must press **Send**. If their device has no email client configured, the form offers a **Copy proposal** fallback.

### How ARTIFICE reviews and publishes a proposal

1. Receive the proposal in the inbox of `contact@artificepractice.com`.
2. Verify the building identity, coordinates, dates and original sources.
3. Open **`atlas-data.js`** on GitHub, copy an existing place object and edit the fields.
4. Commit changes to the `main` branch (ideally through a pull request for review).
5. After GitHub Pages redeploys, the new place appears on the map, in the index and in the tag/category filters.

The recipients are kept in one file: **`atlas-email.js`**. Change `PROPOSAL_EMAIL` there to update the recipient. Do not insert an email address in `atlas.js` or `atlas.html`.

### Security and limitations

No Supabase account, database, dashboard, CAPTCHA, third-party submission service or API key is required. Suggestions are **not automatically published**. Email content is untrusted: verify URLs and facts before adding them to the Atlas.

The obsolete experimental files `atlas-admin.*`, `atlas-config.js` and `supabase/` belong to the abandoned database-based prototype and are not needed by the active email workflow.
