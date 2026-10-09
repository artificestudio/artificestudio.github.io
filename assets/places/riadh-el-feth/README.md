# Riadh El Feth

ARTIFICE Atlas place ID: `riadh-el-feth`.

Upload original photographs, drawings and scans to this folder using **Add file → Upload files**.

Use simple file names, for example `01.webp`, `02.webp`, `plan-01.png`.

## How to display uploaded images

After uploading, open [content/places.js](../../../content/places.js), find `id: "riadh-el-feth"`, and add or edit its `images` list:

```js
images: [
  {
    src: "assets/places/riadh-el-feth/01.webp",
    caption: "Your image caption",
    alt: "Describe what the photograph shows"
  }
]
```

Commit the change. The images will appear on the corresponding Atlas place page once GitHub Pages has deployed.

**Important:** Images uploaded to this folder are stored in GitHub, but are *not automatically published in the gallery* until their filenames are entered into `content/places.js`. Please use originals, not screenshots or thumbnails from Yasmine's inventory table.
