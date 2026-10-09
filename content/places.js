/**
 * ARTIFICE / ATLAS — EDIT THE RESEARCH INVENTORY HERE.
 *
 * Place IDs must stay unique. WGS84 coordinates are always [longitude, latitude].
 * "condition" preserves provisional notes from Yasmine's research table; these are
 * NOT independently verified current closure or demolition announcements.
 * "coordinateSource" documents where an actual location was checked.
 * "locationNote" flags provisional matches when the table names a district rather
 * than a single identifiable building.
 * Upload your own photographs to assets/places/<id>/, then add filenames to images.
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
  "fashion": "Fashion",
  "commercial-decline": "Commercial decline",
  "mixed-program": "Mixed programme",
  "cultural-program": "Cultural programme",
  "transit-oriented": "Transit-oriented",
  "1970s": "1970s",
  "commercial-obsolescence": "Commercial obsolescence",
  "urban-memory": "Urban memory"
};

export const seedPlaces = [
  // FRANCE — existing places completed with the working inventory.
  {
    id: "maine-montparnasse",
    name: "Centre commercial Maine–Montparnasse",
    city: "Paris", country: "France", year: "1973",
    coordinates: [2.3211, 48.8423],
    category: "shopping-mall", tags: ["retail", "adaptive-reuse", "1970s"],
    program: "Retail, offices and public facilities",
    condition: "Working inventory: definitive closure to the public noted for 2026; architectural transformation project in progress. To verify.",
    description: "The Maine–Montparnasse retail complex is the site of ARTIFICE's La machine du dialogue project.",
    project: "projects.html?project=la-machine-du-dialogue",
    images: [
      { src: "assets/places/maine-montparnasse/01.webp", caption: "Existing interior passage", alt: "Interior of the Maine–Montparnasse shopping centre" },
      { src: "assets/places/maine-montparnasse/02.webp", caption: "Existing commercial interior", alt: "Vacant interior of the Maine–Montparnasse shopping centre" }
    ]
  },
  {
    id: "le-millenaire",
    name: "Le Millénaire", city: "Aubervilliers", country: "France", year: "2011",
    coordinates: [2.382, 48.900],
    category: "shopping-mall", tags: ["retail", "periphery", "commercial-decline"],
    program: "Retail and offices",
    area: "56,000 m² retail; 17,000 m² offices (working inventory)",
    condition: "Working inventory: marked decline; approximately 20 of 140 stores reported open. To verify.",
    description: "Shopping-centre and office development in Aubervilliers on the northern edge of Paris."
  },
  {
    id: "bercy-2",
    name: "Bercy 2", city: "Charenton-le-Pont", country: "France", year: "1990",
    coordinates: [2.405, 48.823],
    category: "shopping-mall", tags: ["retail", "periphery", "commercial-decline"],
    program: "Retail",
    area: "36,000 m² retail (working inventory)",
    condition: "Working inventory: decline and recent reinvestment noted; a possible demolition horizon of 2031 was mentioned and requires verification.",
    description: "Shopping centre by Renzo Piano Building Workshop at the edge of Paris."
  },
  {
    id: "la-vache-noire",
    name: "La Vache Noire", city: "Arcueil", country: "France", year: "2007",
    coordinates: [2.32885, 48.81135],
    coordinateSource: "https://mapcarta.com/W62643138",
    category: "shopping-mall", tags: ["retail", "periphery", "commercial-decline"],
    program: "Retail",
    area: "49,263 m² (working inventory)",
    condition: "Working inventory: progressive commercial decline, with 64 of 120 stores reported open. To verify.",
    description: "Shopping centre in Arcueil with a publicly accessible rooftop landscape."
  },
  {
    id: "belle-epine",
    name: "Belle Épine", city: "Thiais", country: "France", year: "1971",
    coordinates: [2.37214, 48.75659],
    coordinateSource: "https://mapcarta.com/W263891555",
    category: "shopping-mall", tags: ["retail", "periphery", "1970s"],
    program: "Retail and cinema",
    area: "140,000 m² (working inventory; scope to verify)",
    condition: "Working inventory: long period of decline and more recent signs of renewed activity, tentatively linked to improved public transport. To verify.",
    description: "A major early regional shopping centre in Thiais, southeast of Paris."
  },

  // ALGERIA
  {
    id: "riadh-el-feth",
    name: "Riadh El Feth", city: "Algiers", country: "Algeria", year: "1982 (construction began)",
    coordinates: [3.07025, 36.74326],
    coordinateSource: "https://mapcarta.com/fr/W1271733343",
    category: "mixed-use-complex", tags: ["retail", "cultural-program", "mixed-program"],
    program: "Retail and cultural facilities",
    condition: "Working inventory: described as nearly abandoned. Present condition to verify.",
    description: "Post-independence commercial and cultural complex at El Madania, inaugurated in the mid-1980s."
  },

  // SOUTH KOREA
  {
    id: "techno-mart",
    name: "Gangbyeon Techno Mart", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.0957, 37.5355],
    category: "electronics-complex", tags: ["retail", "electronics", "technology"],
    program: "Retail",
    description: "Large electronics and entertainment retail complex near Gangbyeon Station."
  },
  {
    id: "venezia-mega-mall",
    name: "Venezia Mega Mall", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.021434, 37.570978],
    coordinateSource: "https://lse.purpleo.kr/article/1415",
    locationNote: "Approximately located from a commercial registry at 400 Cheonggyecheon-ro. Building footprint should be checked.",
    category: "shopping-mall", tags: ["retail", "mixed-program"],
    description: "Shopping complex at 400 Cheonggyecheon-ro, Hwanghak-dong, Seoul."
  },
  {
    id: "migliore-dongdaemun",
    name: "Migliore Dongdaemun", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.008527, 37.567963],
    coordinateSource: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=315&vcontsId=106366",
    locationNote: "The inventory says 'Migliore'. This pin identifies the Dongdaemun branch; confirm it is the intended one.",
    category: "shopping-mall", tags: ["retail", "fashion"],
    description: "Multi-storey fashion retail complex in the Dongdaemun district."
  },
  {
    id: "apm-place",
    name: "apM PLACE", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.00841, 37.5653],
    coordinateSource: "https://mapcarta.com/W400847801",
    category: "shopping-mall", tags: ["retail", "fashion"],
    description: "Multi-storey fashion wholesale and shopping complex at Eulji-ro 276, Dongdaemun."
  },
  {
    id: "hapjeong-mall",
    name: "Hapjeong Mall / Mecenatpolis (provisional)", city: "Seoul", country: "South Korea", year: "",
    coordinates: [126.91378, 37.55089],
    coordinateSource: "https://mapcarta.com/W306956698",
    locationNote: "The inventory only says 'Hapjeong mall'. Mapped provisionally to Mecenatpolis; please confirm the intended building.",
    category: "shopping-mall", tags: ["retail", "mixed-program", "transit-oriented"],
    description: "Shopping and mixed-use complex at Hapjeong Station, provisionally identified with Mecenatpolis."
  },
  {
    id: "goodmorning-city",
    name: "Goodmorning City", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.0075, 37.56668],
    coordinateSource: "https://mapcarta.com/W358284628",
    category: "shopping-mall", tags: ["retail", "fashion"],
    description: "Multi-storey commercial complex in Seoul's Dongdaemun district."
  },
  {
    id: "wangsimni-bitplex",
    name: "Wangsimni / Bitplex (provisional)", city: "Seoul", country: "South Korea", year: "",
    coordinates: [127.0383, 37.56212],
    coordinateSource: "https://mapcarta.com/W1258207418",
    locationNote: "The inventory only says 'Wangsimni'. Mapped provisionally to the Bitplex / Enter-6 complex at Wangsimni Station.",
    category: "mixed-use-complex", tags: ["retail", "mixed-program", "transit-oriented"],
    description: "Shopping and entertainment complex integrated with Wangsimni Station."
  },

  // FOUR ADDITIONAL SITES IN JAPAN, SOUTH KOREA, HONG KONG AND TAIWAN.
  {
    id: "aeon-sanda-woody-town",
    name: "AEON Sanda Woody Town",
    city: "Sanda", country: "Japan", year: "",
    coordinates: [135.18746, 34.90853],
    coordinateSource: "https://mapcarta.com/W506631400",
    category: "shopping-mall",
    tags: ["retail", "cultural-program"],
    program: "Shopping, restaurants and cinema",
    description: "Shopping complex in Sanda Woody Town, Hyogo Prefecture, with a multi-screen cinema. It forms part of the commercial centre of a planned suburban community."
  },
  {
    id: "time-terrace-dongtan",
    name: "Time Terrace Dongtan",
    city: "Hwaseong", country: "South Korea", year: "2022 (renovated and renamed)",
    coordinates: [127.069312, 37.204856],
    coordinateSource: "https://bim.purpleo.kr/article/1297",
    locationNote: "Interpreted from 'Times Square in Dongtan'. This is the Time Terrace mall inside Metapolis, operated by the company behind Seoul Times Square. It is not the unrelated SH Times Square industrial building.",
    category: "shopping-mall",
    tags: ["retail", "consumerism", "mixed-program", "commercial-obsolescence"],
    program: "Retail, restaurants, cinema and leisure",
    condition: "Time Terrace opened after a renovation in April 2022. A change of management was reported in May 2026.",
    description: "Shopping centre within Dongtan's Metapolis residential and commercial complex. Formerly Center Point Mall, the retail spaces were relaunched as Time Terrace in 2022.",
    source: "https://view.asiae.co.kr/en/article/2022031709305224800"
  },
  {
    id: "moko-mong-kok-east",
    name: "MOKO (Grand Century Place)",
    city: "Hong Kong", country: "Hong Kong", year: "1997",
    coordinates: [114.17238, 22.32318],
    coordinateSource: "https://mapcarta.com/W37517528",
    locationNote: "Interpreted from 'Mong Kok East'. This is MOKO, the shopping mall beside Mong Kok East station.",
    category: "shopping-mall",
    tags: ["retail", "mixed-program", "transit-oriented"],
    program: "Retail, restaurants, offices and hotel",
    description: "Multi-level shopping complex connected to Mong Kok East station, integrated with offices and the Royal Plaza Hotel.",
    source: "https://www.wikidata.org/wiki/Q11080935"
  },
  {
    id: "qianyue-building",
    name: "Qianyue Building (千越大樓)",
    city: "Taichung", country: "Taiwan", year: "1970s",
    coordinates: [120.68314, 24.13827],
    coordinateSource: "https://explander.com/east-central-asia/taiwan/taichung/qianyue-building-taichung-taiwan/",
    category: "mixed-use-complex",
    tags: ["retail", "commercial-obsolescence", "urban-memory", "adaptive-reuse", "1970s"],
    program: "Former department store, retail, dining, nightlife and residential uses",
    condition: "Much of the building has been vacant since the decline of its commercial activities and a fire in 2005. Artists occupied parts of it between 2017 and 2021. Its present access and remaining uses require verification.",
    description: "An ageing mixed-use commercial building near Taichung Station, known for its former rooftop restaurant and its partial reuse by artists during the Escape Plan X initiative.",
    source: "https://www.taipeitimes.com/News/feat/archives/2025/05/13/2003836777"
  },

  // ADDITIONAL ARTIFICE RESEARCH PLACES (already on the Atlas; preserved)
  {
    id: "dongtan",
    name: "Dongtan New Town", city: "Hwaseong", country: "South Korea", year: "2007 (first phase)",
    coordinates: [127.071, 37.206],
    category: "new-town", tags: ["masterplanning", "consumerism", "residential"],
    description: "A planned new town whose apartment brands, infrastructure and corporate economies offer a lens onto contemporary urban consumption."
  },
  {
    id: "nakano-broadway",
    name: "Nakano Broadway", city: "Tokyo", country: "Japan", year: "1966",
    coordinates: [139.6658, 35.7092],
    category: "mixed-use-complex", tags: ["retail", "subculture"],
    description: "A multi-storey shopping complex that evolved into a dense ecosystem of specialist retail and subcultures.",
    images: [{ src: "assets/places/nakano-broadway/DSC01831.JPG", caption: "Nakano Broadway", alt: "Photograph of Nakano Broadway" }]
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
  const haystack = [
    place.name, place.city, place.country, place.description,
    place.program,place.condition,place.locationNote
  ].filter(Boolean).join(" ").toLowerCase();
  return categoryMatch && tagsMatch && haystack.includes(searchTerm.trim().toLowerCase());
}
