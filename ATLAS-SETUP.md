# ARTIFICE Atlas prototype
The atlas lives at atlas.html. This is a review branch; main is unchanged.

## Stack
OpenLayers + proj4 EPSG:8857 Equal Earth view; OSM raster tiles reprojected by OpenLayers; responsive HTML/CSS; static seedPlaces in atlas-data.js. Tiles require an internet connection and compliance with OSM tile use policy. At large scales raster reprojection can produce seams / blurring; this is a proof-of-concept, not a guaranteed seamless vector GIS solution. A custom vector tile style/server is the recommended production upgrade for rigorously white oceans and high zoom performance.

## Publishing content
Seed entries edit in atlas-data.js. Add metadata and image galleries on atlas-place.html/JS. Factual coordinates and construction dates need editorial verification: approximate data and broad date ranges are labelled.

## Public contributions
Create Supabase project, execute atlas-schema.sql and paste its public URL and **anon** key in atlas-config.js. Never publish service_role keys. Contributions enter pending status. Review and publish in the Supabase dashboard (Table Editor). Without Supabase, submissions explicitly stay disabled, not stored. A public Google/GitHub secret is not needed.

## Security
Add CAPTCHA, rate limiting and moderation at an Edge Function before enabling public submissions for a real audience. Policies disallow edits/deletes for public users. Admin UI is not yet built; Supabase dashboard serves as secured private editor. Supabase Free tier quotas and OSM tile fair use policies apply.

## Test
Verify viewport, zoom, coordinates, map rendering, submission error handling, and touch gestures in real browsers. GitHub preview is served via static file or PR deployment. OpenLayers version pins can be updated deliberately.
