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

## Atlas moderation: public proposals and private editorial dashboard

This workflow is prepared in `atlas-admin.html`, `atlas-admin.js`,
`supabase/migrations/001_atlas_review.sql`, and
`supabase/functions/atlas-submit/index.ts`.

**The database is NOT created automatically by pushing GitHub code.**
To activate submissions safely, follow the steps below. Until then the
public Atlas continues to work with its existing six static records and
the submission form explicitly says contributions are not enabled.

### Installation (one-time)

1. Create an ARTIFICE Supabase project (the Free plan can be sufficient at low traffic). In **SQL Editor**, execute `supabase/migrations/001_atlas_review.sql`. This creates three tables (`atlas_editors`, `atlas_submissions`, `atlas_places`) and their access policies, plus the secure approve/reject RPC.
2. In Supabase **Authentication → Providers → Email**, enable email OTP/magic-link sign-ins. Add `https://www.artificepractice.com/atlas-admin.html` to the list of allowed redirect URLs. You may restrict sign-ups to known users and manually invite your two editor accounts.
3. In Supabase **SQL Editor**, add the two ARTIFICE editorial email addresses to the `atlas_editors` whitelist using the commented INSERT statement at the bottom of the migration. Never add these emails to public JavaScript.
4. Create a **Cloudflare Turnstile** widget for `artificepractice.com` and `www.artificepractice.com`. Copy its public **site key**. Keep its **secret key** private.
5. Set the private `TURNSTILE_SECRET_KEY` in Supabase Edge Function secrets. Deploy `atlas-submit` from `supabase/functions/atlas-submit/index.ts` with JWT verification disabled **for that function only** (visitors do not have an account). The function checks Turnstile before inserting a pending submission. Supabase manages `SUPABASE_URL` and the server-side service-role credential.
6. Enter the Supabase Project URL, **public** anon/publishable key and the public Turnstile site key in `atlas-config.js`, commit to GitHub. **NEVER commit service-role keys, passwords, JWT signing secrets or Turnstile secret keys.** Configure abuse-rate monitoring and edge-level rate limits for production.
7. Open `https://www.artificepractice.com/atlas-admin.html` and log in by email link. Only editors whitelisted in the database can see submissions or save/reject them.

### Editorial workflow

- **Visitor:** Click *Propose a place*, then choose a map location, add the name, city, country, construction date, architectural category, optional tags, description and reference. Pass anti-spam verification. The server stores the suggestion in `atlas_submissions` with status **pending**; no public user can read this table.
- **Editor:** Sign in to the private dashboard and open **Pending**. Check the proposal; edit the coordinates, category, tags, year, text, citation, slug and optional project link.
- **Approve & publish:** A database function atomically creates the publication in `atlas_places` and marks the submitted proposal **approved**. It then appears in the public Atlas and gets a detail page (`atlas-place.html?id=slug`).
- **Approve as draft:** Move it into the editorial catalogue but keep the public map unchanged.
- **Reject:** Retain the proposal in the private Reviewed history with an optional editorial note, without publishing.
- **Published & drafts:** Edit or hide places previously created through the dashboard. To edit one of the six initial hard-coded places, import it as a database record with its existing ID (the database overrides the static record on public pages); direct editing of static records via the dashboard has not been implemented yet. You can also edit static records in `atlas-data.js`.

**Security:** Access is enforced by PostgreSQL Row Level Security and the
`atlas_is_editor()` function, not by hiding the admin page. The public
form never receives administrative credentials. The approval function
does not permit a proposal to be approved or rejected twice.

### Finding and editing the relevant code

- Visitor fields: `atlas.html`; submission request: `atlas.js`.
- Private dashboard layout: `atlas-admin.html`; styles: `atlas-admin.css`.
- Dashboard login, review, approval and editing: `atlas-admin.js`.
- Database schema and access rules: `supabase/migrations/001_atlas_review.sql`.
- Spam-verified public API: `supabase/functions/atlas-submit/index.ts`.
- Public site settings: `atlas-config.js`.
- Base-map, tags and catalogue: `atlas-data.js`, `atlas.css`, `atlas.js`.

#### Important notes

- Keep `atlas-preview/` as a historical read-only prototype. It is not the source of the public Atlas.
- User-contributed content is editorial input, not trusted instructions or HTML. Display descriptions as plain text, and validate any outgoing links before publishing them.
- This design includes CAPTCHA and a private inbox but not a guaranteed global abuse quota. Add a per-IP/session rate limit at the edge before promoting the form broadly.
