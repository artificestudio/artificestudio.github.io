/**
 * ARTIFICE ATLAS — CONTENT DATABASE
 *
 * This file is the ONLY place to edit the six starter records, their pins,
 * typologies and tags. The map, filters, index and detail pages read it.
 *
 * Coordinates are [longitude, latitude] in WGS84 decimal degrees.
 * See README.md before adding or editing a place.
 */

export const CATEGORIES = [
  { id: "shopping-mall", label: "Shopping mall" },
  { id: "department-store", label: "Department store" },
  { id: "cinema-complex", label: "Cinema complex" },
  { id: "amusement-park", label: "Amusement park" },
  { id: "electronics-complex", label: "Electronics complex" },
  { id: "mixed-use-complex", label: "Mixed-use complex" },
  { id: "new-town", label: "New town" },
  { id: "hotel", label: "Hotel" },
  { id: "airport", label: "Airport" },
  { id: "car-park", label: "Car park" },
  { id: "residential-complex", label: "Residential complex" },
  { id: "other", label: "Other" }
];

export const TAG_LABELS = {
  "adaptive-reuse": "Adaptive reuse",
  "consumerism": "Consumerism",
  "electronics": "Electronics",
  "masterplanning": "Masterplanning",
  "periphery": "Periphery",
  "residential": "Residential",
  "retail": "Retail",
  "subculture": "Subculture",
  "technology": "Technology",
  "1970s": "1970s"
};

export const seedPlaces = [
  {
    id: "dongtan",
    name: "Dongtan New Town",
    city: "Hwaseong",
    country: "South Korea",
    year: "2007 (first phase)",
    coordinates: [127.071, 37.206],
    category: "new-town",
    tags: ["masterplanning", "consumerism", "residential"],
    description: "A planned new town whose apartment brands, infrastructure and corporate economies offer a lens onto contemporary urban consumption."
  },
  {
    id: "maine-montparnasse",
    name: "Maine Montparnasse",
    city: "Paris",
    country: "France",
    year: "1970s",
    coordinates: [2.3211, 48.8423],
    category: "shopping-mall",
    tags: ["retail", "adaptive-reuse", "1970s"],
    description: "A late-modern commercial complex at the centre of ARTIFICE's project La machine du dialogue.",
    project: "projects.html"
  },
  {
    id: "bercy-2",
    name: "Bercy 2",
    city: "Charenton-le-Pont",
    country: "France",
    year: "1990",
    coordinates: [2.405, 48.823],
    category: "shopping-mall",
    tags: ["retail", "periphery"],
    description: "Shopping centre designed by Renzo Piano Building Workshop, at the edge of Paris."
  },
  {
    id: "le-millenaire",
    name: "Le Millénaire",
    city: "Aubervilliers",
    country: "France",
    year: "2011",
    coordinates: [2.382, 48.900],
    category: "shopping-mall",
    tags: ["retail", "periphery"],
    description: "A major shopping-centre development on the northern edge of Paris."
  },
  {
    id: "techno-mart",
    name: "Gangbyeon Techno Mart",
    city: "Seoul",
    country: "South Korea",
    year: "",
    coordinates: [127.0957, 37.5355],
    category: "electronics-complex",
    tags: ["electronics", "technology", "retail"],
    description: "Large-scale electronics and entertainment retail complex near Gangbyeon Station."
  },
  {
    id: "nakano-broadway",
    name: "Nakano Broadway",
    city: "Tokyo",
    country: "Japan",
    year: "1966",
    coordinates: [139.6658, 35.7092],
    category: "mixed-use-complex",
    tags: ["retail", "subculture"],
    description: "A multi-storey shopping complex that evolved into a dense ecosystem of specialist retail and subcultures."
  }
];

export function categoryLabel(id) {
  return CATEGORIES.find(category => category.id === id)?.label || "Uncategorised";
}

export function tagLabel(id) {
  return TAG_LABELS[id] || String(id).replaceAll("-", " ").replace(/\b\w/g, char => char.toUpperCase());
}

export function matchesFilters(place, category, selectedTags, searchTerm = "") {
  const categoryMatch = category === "all" || place.category === category;
  const tags = Array.isArray(place.tags) ? place.tags : [];
  const tagsMatch = selectedTags.every(tag => tags.includes(tag));
  const haystack = [place.name, place.city, place.country, place.description].join(" ").toLowerCase();
  return categoryMatch && tagsMatch && haystack.includes(searchTerm.trim().toLowerCase());
}
