/**
 * ADD / EDIT PROJECTS HERE. No need to change the gallery script.
 * A project's URL is projects.html?project=<id>.
 * Images can be uploaded through GitHub to assets/projects/<id>/.
 * See README.md for the full tutorial.
 */
export const projects = [
  {
    id: "la-machine-du-dialogue",
    title: "La machine du dialogue",
    site: "Maine–Montparnasse",
    city: "Paris",
    country: "France",
    years: "2025–2026",
    atlasPlaceId: "maine-montparnasse",
    description: [
        "La machine du dialogue emerges from the ambition to transform the Maine Montparnasse shopping centre, a consumerist remnant, into a civic infrastructure dedicated to exchange and engagement.",
        "Rather than erasing this ruin-like architecture inherited from the Trente Glorieuses, the project chooses to graft itself onto it, preserving its essential structure while subverting its commercial logic. A place once based on consumption is replaced by a place based on speech, encounter, and the collective production of ideas.",
        "Organised around a citizens’ assembly composed of randomly selected participants and experts, the project is accompanied by thematic pavilions hosting exhibitions, workshops, and discussion spaces open to the public, while also integrating the existing facilities."
    ],
    images: [
      { src: "assets/maine-01.webp", caption: "The architectural model", alt: "Architectural model showing the open stacked levels of the project" },
      { src: "assets/maine-02.webp", caption: "Spaces for discussion", alt: "Frontal view of the model, with public spaces across the levels" },
      { src: "assets/maine-03.webp", caption: "The existing passage", alt: "Dark interior of the existing Maine Montparnasse shopping centre" },
      { src: "assets/maine-04.webp", caption: "The existing centre", alt: "Vacant interior of the shopping centre" },
      { src: "assets/maine-05.webp", caption: "Maine Montparnasse in its urban setting", alt: "Site model seen from above" },
      { src: "assets/maine-06.webp", caption: "The model in progress", alt: "Hands at work on a physical model of the project" },
      { src: "assets/maine-07.webp", caption: "Longitudinal section", alt: "Long architectural section of the existing building and intervention" },
      { src: "assets/maine-08.webp", caption: "The citizens’ assembly", alt: "Drawing of the assembly chamber and surrounding public spaces" },
      { src: "assets/maine-09.webp", caption: "Public circulation", alt: "Architectural drawing showing movement through the project" },
      { src: "assets/maine-10.webp", caption: "Thematic pavilions", alt: "Architectural drawing of a pavilion within the building" },
      { src: "assets/maine-11.webp", caption: "Section and programmes", alt: "Architectural section showing the relationship between uses" },
      { src: "assets/maine-12.webp", caption: "Ground floor plan", alt: "Plan of the ground floor and public approaches" },
      { src: "assets/maine-13.webp", caption: "Upper floor plan", alt: "Plan of the second floor of the proposed building" }
    ]
  }
];
export const findProject = id => projects.find(project => project.id === id);
