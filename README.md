# ARTIFICE — how to edit the website

**Live website:** https://www.artificepractice.com  
**Repository:** https://github.com/artificestudio/artificestudio.github.io

This website is hosted for free on **GitHub Pages**. You can add places, projects and pictures **without programming, installing software or using Supabase**.

> **Start here:** Nearly all day-to-day editing happens in the **`content/`** folder, plus image uploads to **`assets/`**. The `scripts/` folder is for website behavior; do not modify it to add content.

## 1. Where everything is

```text
artificestudio.github.io/
│
├── README.md                      ← YOU ARE HERE. Editing manual
├── index.html                     ← Home page / manifesto
├── about.html                     ← About page
├── contact.html                   ← Contact page
├── projects.html                  ← Reusable project page + automatic index
├── atlas.html                     ← Map and filters
├── atlas-place.html               ← Reusable Atlas place page
│
├── content/                       ★ EDIT THIS FOLDER
│   ├── projects.js                ★ Add projects, descriptions and images
│   ├── places.js                  ★ Add Atlas places, coordinates and images
│   ├── email.js                   ★ Atlas proposal email address
│   └── README.md                  ← Short reminder
│
├── assets/                        ★ UPLOAD PICTURES HERE
│   ├── maine-01.webp ... 13.webp  ← Existing project images (kept unchanged)
│   ├── projects/                  ← New project photo folders
│   ├── places/                    ← New Atlas photo folders
│   └── ...                        ← Home video/audio and contact photo
│
├── scripts/                       ← Site programming (normally leave alone)
│   ├── projects.js                ← Image gallery + projects listing
│   ├── atlas.js                   ← Map, filters and email form
│   └── atlas-place.js             ← Individual place gallery
│
├── styles.css                     ← Shared site design + project page design
├── atlas.css                      ← Map colors, pins, filters, mobile design
└── CNAME                          ← Domain configuration: DO NOT EDIT
```

### Quick reference: what do I want to change?

| I want to… | Edit |
| --- | --- |
| Add an Atlas pin | [content/places.js](content/places.js) |
| Change location, date or tags of a pin | [content/places.js](content/places.js) |
| Add/change pictures on an Atlas place page | [assets/](assets/) + [content/places.js](content/places.js) |
| Add a new architectural/artistic project | [content/projects.js](content/projects.js) |
| Add/change a project's gallery pictures/captions | [assets/](assets/) + [content/projects.js](content/projects.js) |
| Edit a project's name, location or description | [content/projects.js](content/projects.js) |
| Change the Atlas proposal email | [content/email.js](content/email.js) |
| Edit the homepage text | [index.html](index.html) |
| Edit team/contact info | [about.html](about.html) / [contact.html](contact.html) |
| Adjust fonts, title spacing, project gallery size | [styles.css](styles.css) |
| Adjust map height, marker colors and filters | [atlas.css](atlas.css) |

## 2. Edit a file in GitHub (no terminal required)

1. Open the repository on GitHub and make sure the branch selector says **main**.
2. Click the file (for example `content/places.js`).
3. Click the **pencil icon** (“Edit this file”).
4. Change the text **carefully, keeping commas `,`, quotation marks `"` and brackets `{}`**.
5. Click **Commit changes…**, enter a brief description such as “Add Nakano place photos”, and confirm.
6. Visit **Actions → pages build and deployment**. When the build finishes, refresh the website (on Mac: **Cmd + Shift + R**).

**Safer option:** GitHub can offer “Create a new branch and start a pull request”; this lets the other editor review the changes before merging into `main`. Use this for large edits.

Do **not** rename or delete `index.html`, `CNAME`, `scripts/` or the existing picture files without also updating all references.

## 3. Add a NEW PLACE to the Atlas

**Edit:** [content/places.js](content/places.js) → `seedPlaces`.

Each `{ ... }` is one location. Copy an existing entry, add a comma between records, and replace its contents.

```js
{
  id: "example-cinema",
  name: "Example Cinema",
  city: "Tokyo",
  country: "Japan",
  year: "1985",
  coordinates: [139.7000, 35.6800],
  category: "cinema-complex",
  tags: ["subculture", "retail"],
  description: "An example space to be documented by ARTIFICE.",
  images: [
    {
      src: "assets/places/example-cinema/exterior.webp",
      caption: "Exterior view",
      alt: "Main entrance of the cinema"
    }
  ]
},
```

**Important rules:**

- `id` must be **unique**, lowercase and hyphenated (`example-cinema`). Never change the ID after publishing unless you also update all links.
- `coordinates` means **[LONGITUDE, LATITUDE]** (not the other way around), in decimal degrees / WGS84. To find these, right-click a place in OpenStreetMap and read its coordinates.
- `year` is the opening or construction date **only when verified**. Unknown? Use `year: ""`.
- `category` is **one architectural typology**, selected from the `CATEGORIES` list at the top of the same file.
- `tags` can contain multiple research themes. The available public filters update automatically.
- `description` is plain text between quotation marks. If your description includes double quotes, escape them or use a backtick string.
- `images` is optional. See section 5 below.
- `project` is optional. Link to a separate ARTIFICE project when relevant (see section 6).

**What happens next?** The place appears automatically as a red pin, in the Atlas index, in the filters, and on its own page:

`https://www.artificepractice.com/atlas-place.html?id=example-cinema`

**To edit an existing place**, find the entry with its `id`, change the relevant fields, and commit.

### Create a new category or tag

- To add a **typology**, add `{ id: "water-park", label: "Water park" }` to `CATEGORIES` in `content/places.js`. Then use `category: "water-park"` on a place.
- To add a **research tag**, add (if you want its display label) `"artificial-nature": "Artificial nature"` to `TAG_LABELS`, then add `"artificial-nature"` to any place's `tags` array.
- Category and tag filters appear once at least one place uses that value.

## 4. Add a NEW PROJECT (with a new page)

**Edit:** [content/projects.js](content/projects.js).

Copy the existing project object inside the `projects` array, add a comma between objects, then change its `id`, `title`, location, description and images.

```js
{
  id: "tokyo-workshop",
  title: "Tokyo Workshop",
  site: "Nakano",
  city: "Tokyo",
  country: "Japan",
  years: "2026",
  atlasPlaceId: "nakano-broadway",
  description: [
    "A first paragraph explaining the context and research.",
    "A second paragraph explaining the methods and proposals."
  ],
  images: [
    {
      src: "assets/projects/tokyo-workshop/01.webp",
      caption: "The surveyed building",
      alt: "Street view of the building in Tokyo"
    },
    {
      src: "assets/projects/tokyo-workshop/02.webp",
      caption: "Point cloud survey",
      alt: "LiDAR point cloud of the building"
    }
  ]
},
```

**No HTML or gallery coding is needed.** A link to your project automatically appears in the **Projects** index on the main project page. Its own address will be:

`https://www.artificepractice.com/projects.html?project=tokyo-workshop`

If someone visits `projects.html` without a `?project=` parameter, it opens the first project in the array (currently **La machine du dialogue**).

- `description` is an array of paragraphs; each quoted line becomes one paragraph.
- `images` is an ordered list: move an entry up/down to rearrange the gallery.
- Each image needs `src`, a visible `caption`, and descriptive `alt` text for accessibility.
- Use `atlasPlaceId` to make “City, Country” link to a real Atlas pin. **The value must exactly match a place's `id` in `content/places.js`**.
- If the project has no Atlas location yet, omit the `atlasPlaceId` line.

**Change an existing project** by finding its `id` in `content/projects.js`. Updating its text or image list automatically updates the page; you do not need to edit `projects.html` or `scripts/projects.js`.

## 5. HOW TO UPLOAD PICTURES

Images live in the `assets/` folder. **Do not paste large image data or HTML inside your content file** — upload the actual image first, then refer to it with `src`.

### A. Upload the file to GitHub

1. Prepare the picture: use `.webp` (recommended), `.jpg` or `.png`. Prefer around **1600–2400 px** along the long edge for photographic documentation, and compress files before uploading. Keep images reasonably small for mobile.
2. Name it simply: `01.webp`, `02.webp`, `site-plan.webp`, etc. Avoid spaces, accents and special characters in filenames.
3. Go to GitHub → the repository → **assets**. For a project, put the images in `assets/projects/YOUR-PROJECT-ID/`; for a place, use `assets/places/YOUR-PLACE-ID/`.
4. To create a new folder, use **Add file → Create new file**, type a path like `assets/projects/tokyo-workshop/README.md`, add a short line, and commit. GitHub creates the nested path.
5. Navigate into that folder and click **Add file → Upload files**; select the actual images, then **Commit changes**.
6. Click an image in GitHub and double-check its filename and folder. You can now refer to it in the project's or place's `images` array.

### B. Add the picture to the website

Example **project photo** in `content/projects.js`:

```js
images: [
  { src: "assets/projects/tokyo-workshop/01.webp", caption: "Outside", alt: "Street facade" },
  { src: "assets/projects/tokyo-workshop/02.webp", caption: "Interior", alt: "Interior staircase" }
]
```

Example **Atlas place photo** in `content/places.js`:

```js
images: [
  { src: "assets/places/example-cinema/exterior.webp", caption: "Exterior, 2026", alt: "Cinema entrance" },
  { src: "assets/places/example-cinema/interior.webp", caption: "Interior, 2026", alt: "View of the atrium" }
]
```

Save the content file. Once GitHub Pages deploys, you can browse photos using the gallery controls.

**Existing Maine–Montparnasse images** currently live at `assets/maine-01.webp` through `assets/maine-13.webp`; they have been preserved to avoid broken links. Their visible captions are now edited inside `content/projects.js`.

### C. Common image problems

- **Broken picture / empty frame:** check spelling, capitalization and path. GitHub is case-sensitive. `01.webp` ≠ `01.WEBP`.
- **Image is not updating:** hard-refresh your browser and verify the GitHub Pages deployment finished.
- **Wrong orientation or huge image:** prepare and resize it on your computer, then re-upload/replace it in GitHub.
- **No picture on a place page:** add an `images` array to that place's record (empty places show “Documentation in progress”).
- **Copyright:** only upload photographs, scans, renderings and other materials you have permission to publish.

## 6. Link a PROJECT and an ATLAS PLACE in both directions

For example, “La machine du dialogue” is a **project**, and “Maine–Montparnasse” is an **Atlas place**.

In `content/projects.js`:

```js
atlasPlaceId: "maine-montparnasse",
```

This makes the red-dot “Paris, France” location line open the Atlas centered on that site.

In the corresponding `content/places.js` record:

```js
project: "projects.html?project=la-machine-du-dialogue",
```

This adds a “Explore ARTIFICE's project →” link on the Atlas place page. Linking is optional in either direction.

## 7. Changing the overall look

- **Whole site font / header / project page layout:** `styles.css`
- **Atlas dimensions / point colors / tag filters:** `atlas.css`
- **Landing page text and video:** `index.html`
- **Atlas map rendering engine and zoom logic:** `scripts/atlas.js` (**advanced; do not edit casually**)

MapLibre and the OpenFreeMap black/white map style have been intentionally left unchanged. Do **not** override MapLibre's marker positioning with `position:relative` or you may shift map pins as you zoom.

## 8. Visitor proposals arrive by EMAIL

Clicking “Propose a place” on the Atlas opens a prepared email addressed to **contact@artificepractice.com**. Visitors must press **Send** in their mail application. You review the email, verify the place, then add it to `content/places.js`.

To change the recipient, edit `PROPOSAL_EMAIL` in `content/email.js`. There is **no Supabase account or database** connected to the active site.

## 9. Save changes, verify, and undo if needed

After committing to `main`, GitHub Pages normally builds the live site automatically. See the repository **Actions** tab for the deployment status.

If a page stops working after your edit:

1. Check for a missing comma or quotation mark in the edited `.js` content.
2. Verify the new picture file exists at the exact `src` path.
3. Check the browser developer console for errors if comfortable.
4. On GitHub, open the file → **History**, select the last working commit and restore the old version; or revert the change through a pull request.
5. Ask ChatGPT to review the specific GitHub file or error and explain the fix.

**Never put passwords, private API keys, or personal documents in this public repository.** You do not need to modify `CNAME`, install anything, or write code to add catalogue content.

---

**Editing summary:** `content/places.js` = Atlas • `content/projects.js` = Projects • `assets/` = Pictures • `content/email.js` = Proposal inbox.
