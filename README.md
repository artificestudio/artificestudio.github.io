# ARTIFICE — how to edit the website

**Live website:** https://www.artificepractice.com  
**Repository:** https://github.com/artificestudio/artificestudio.github.io

This website is hosted for free on **GitHub Pages**. You can add places, projects and pictures **without programming, installing software or using Supabase**.

> **Start here:** Nearly all day-to-day editing happens in the **`content/`** folder, plus image uploads to **`assets/`**. The `scripts/` folder is for website behavior; do not modify it to add content.


## Homepage: ARTIFICE Radio and ARTIFICE Time

The homepage (index.html) has two minimalist modules rendered above the existing film and original Babel drawing.

**ARTIFICE Radio** plays the existing Techno Mart recording at `assets/artifice-ambient.mp3` on repeat. Browsers commonly block unmuted audio autoplay. The site tries playing on arrival, then waits for a user interaction if blocked. Visitors can always press PLAY or PAUSE. To swap the track, replace the audio source in `index.html` and update the displayed `TECHNO MART` title. Do not rename the existing audio asset accidentally.

**ARTIFICE Time** draws a random place from `content/places.js` every five seconds. It includes only entries whose `year` is precisely four digits such as `"1966"`; descriptive or provisional dates like `"1970s"`, `"2007 (first phase)"` or `"2022 (renovated and renamed)"` are excluded on purpose. It displays approximate **calendar years**, not made-up exact elapsed days, because the inventory usually lacks construction months and days. Each clock entry links to the place's Atlas record.

The homepage player and time layouts are defined near the bottom of `styles.css` and use Times New Roman. No external services or database are needed.

## 1. Where everything is

```text
artificestudio.github.io/
│
├── README.md                      ← YOU ARE HERE. Editing manual
├── index.html                     ← Original video home / manifesto
├── about.html                     ← White, free-flowing About page
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

## 10. Uploading photographs for Yasmine's inventory (October 2026)

The inventory now includes **13 locations** (5 in France, 1 in Algeria, 7 in South Korea), plus two existing Atlas research locations, **Dongtan** and **Nakano Broadway**. Every place already has its **own image folder** under [assets/places/](assets/places/).

### The quick procedure

1. Open [assets/places/](assets/places/), click the folder of the location, for example [la-vache-noire](assets/places/la-vache-noire/).
2. Choose **Add file → Upload files** and drag your photos into that exact folder. Commit the uploads. You can upload multiple photographs in one batch.
3. Give the files simple unique names, preferably `01.webp`, `02.webp`, etc. Photographs, drawings and scanned plans are all welcome. Use original images, not the small previews embedded in the table screenshot.
4. **To publish the gallery**, open [content/places.js](content/places.js), find the place by `id` and add `images: [{src:"assets/places/la-vache-noire/01.webp",caption:"Atrium",alt:"Interior of the shopping centre"}]`. Multiple entries create a browsable gallery.
5. Or **ask ChatGPT to attach all photos you have uploaded**, and specify which places. It can inspect the GitHub folders and update `content/places.js` to link the files. You do *not* have to hand-write the gallery entries.

**Uploading a file is not the same as publishing it on the page.** Keeping original media separate from the gallery list allows ARTIFICE to curate, order, caption and omit photos independently.

### Place folders

| Country | Place | Photo folder |
| --- | --- | --- |
| France | Centre commercial Maine–Montparnasse | [maine-montparnasse](assets/places/maine-montparnasse/) |
| France | Le Millénaire | [le-millenaire](assets/places/le-millenaire/) |
| France | Bercy 2 | [bercy-2](assets/places/bercy-2/) |
| France | La Vache Noire | [la-vache-noire](assets/places/la-vache-noire/) |
| France | Belle Épine | [belle-epine](assets/places/belle-epine/) |
| Algeria | Riadh El Feth | [riadh-el-feth](assets/places/riadh-el-feth/) |
| South Korea | Gangbyeon Techno Mart | [techno-mart](assets/places/techno-mart/) |
| South Korea | Venezia Mega Mall | [venezia-mega-mall](assets/places/venezia-mega-mall/) |
| South Korea | Migliore Dongdaemun | [migliore-dongdaemun](assets/places/migliore-dongdaemun/) |
| South Korea | apM PLACE | [apm-place](assets/places/apm-place/) |
| South Korea | Hapjeong Mall (provisional Mecenatpolis) | [hapjeong-mall](assets/places/hapjeong-mall/) |
| South Korea | Goodmorning City | [goodmorning-city](assets/places/goodmorning-city/) |
| South Korea | Wangsimni (provisional Bitplex) | [wangsimni-bitplex](assets/places/wangsimni-bitplex/) |
| South Korea | Dongtan New Town (existing) | [dongtan](assets/places/dongtan/) |
| Japan | Nakano Broadway (existing) | [nakano-broadway](assets/places/nakano-broadway/) |

### Facts that still need checking

- This first import follows Yasmine's working inventory, not a fully verified publication. Surfaces, shop occupancy statistics, operational condition and future demolition/closure dates require primary-source verification. The record notes explicitly mark these as provisional.
- Coordinates are checked against a map where possible, but some Seoul sites are provisional matches. The spreadsheet only gives *Hapjeong mall* and *Wangsimni*, so these have been provisionally matched to **Mecenatpolis** and **Bitplex / Enter-6** respectively. Confirm these before treating the point locations as authoritative.
- The *Migliore* record is mapped to **Migliore Dongdaemun**. Confirm the branch.
- The original photo files for the other sites have **not** yet been uploaded. Upload them via GitHub so they can be attached and captioned later.

The date, `program`, `area`, `condition` and `locationNote` fields are edited in [content/places.js](content/places.js), and the place details render them as research notes.

## Four additional Atlas sites in East Asia, October 2026

The Atlas now includes:

| Atlas place | Place ID | Image folder |
| --- | --- | --- |
| AEON Sanda Woody Town, Japan | `aeon-sanda-woody-town` | [Upload images](assets/places/aeon-sanda-woody-town/) |
| Time Terrace Dongtan, South Korea | `time-terrace-dongtan` | [Upload images](assets/places/time-terrace-dongtan/) |
| MOKO at Mong Kok East, Hong Kong | `moko-mong-kok-east` | [Upload images](assets/places/moko-mong-kok-east/) |
| Qianyue Building, Taichung, Taiwan | `qianyue-building` | [Upload images](assets/places/qianyue-building/) |

**Name checks:** The user-supplied name *Times Square at Dongtan* is provisionally interpreted as *Time Terrace Dongtan*, the former Center Point mall in Metapolis. *Mong Kok East* is provisionally interpreted as MOKO, Grand Century Place. Update these if the reference buildings are different.

To display original photographs, upload them into the matching folder and add their paths in the relevant `images` list inside [content/places.js](content/places.js). Files are not automatically inserted into the public gallery, so editorial selection and ordering remain under ARTIFICE's control.
