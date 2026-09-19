/**
 * The page is a surveyed map sheet, so the content is modelled as survey data:
 * stations, a traverse, a legend and a correspondence block. Nothing here is
 * invented — every field maps onto something real (a project, an employer, a
 * tool actually used). The cartographic vocabulary is the presentation; the
 * facts underneath are unchanged.
 */

export type Plate = {
  id: string;
  numeral: string;
  title: string;
};

export const PLATES: Plate[] = [
  { id: "territory", numeral: "I", title: "The territory" },
  { id: "stations", numeral: "II", title: "Stations" },
  { id: "section", numeral: "III", title: "Section" },
  { id: "legend", numeral: "IV", title: "Legend" },
  { id: "correspondence", numeral: "V", title: "Correspondence" },
];

/** The title block that sits on every proper map sheet. */
export const CARTOUCHE = {
  overline: "A survey of",
  lines: ["The work of", "Vinit Khandal"],
  meta: [
    { label: "Subject", value: "Software engineer · interfaces, mobile, systems" },
    { label: "Locality", value: "Bengaluru, India" },
    { label: "Compiled", value: "2022 — 2026" },
    { label: "Scale", value: "1:1, drawn from life" },
  ],
  note: "Four stations surveyed across three localities. Legend on plate IV.",
};

/** Selected work. `locality` is the employer, `materials` what it was built from. */
export const STATIONS = [
  {
    mark: "01",
    name: "White-label design system",
    locality: "Juspay",
    materials: "Design tokens · theming · component library",
    note: "Built to be reconfigured, not forked. Every team restyles tokens, swaps components and reshapes theming to their own brand without touching the code underneath.",
  },
  {
    mark: "02",
    name: "Cross-platform mobile app",
    locality: "Juspay",
    materials: "React Native · iOS · Android",
    note: "A React Native app sharing business logic with the web platform while keeping native-feeling performance across iOS and Android.",
  },
  {
    mark: "03",
    name: "Payment interfaces at scale",
    locality: "Juspay",
    materials: "React · PureScript",
    note: "Checkout and payment surfaces for India's largest payments infrastructure, where a dropped frame is a dropped transaction.",
  },
  {
    mark: "04",
    name: "Testing ecosystem",
    locality: "Bliro",
    materials: "TypeScript · CI/CD",
    note: "Unit, integration and end-to-end coverage for a desktop app, plus the TypeScript migration and the CI/CD and linting standards around it.",
  },
];

/**
 * The traverse: the route walked between localities, drawn as a section. `from`
 * and `to` are years on the horizontal axis; `rise` positions the marker on the
 * profile and is ordering only, not a measurement of anything.
 */
export const TRAVERSE = [
  {
    locality: "Quinite Technologies",
    role: "Frontend Developer",
    from: 2022,
    to: 2023,
    place: "Remote, India",
    rise: 0.34,
    note: "Feature delivery across teams, shipping product work to a high standard.",
  },
  {
    locality: "Bliro",
    role: "Full Stack Developer",
    from: 2023,
    to: 2024,
    place: "Remote, Germany",
    rise: 0.58,
    note: "Testing ecosystem end to end, the desktop app's TypeScript migration, CI/CD and linting standards, Stripe and Jira integrations.",
  },
  {
    locality: "Juspay",
    role: "UI Developer",
    from: 2024,
    to: 2026,
    place: "Bengaluru",
    rise: 0.86,
    note: "Payment interfaces for India's largest payments infrastructure. Design systems and frontend architecture.",
  },
];

export const SURVEY_START = 2022;
export const SURVEY_END = 2026;

/** The key to the sheet — what the symbols stand for, and what he does with them. */
export const LEGEND = [
  {
    symbol: "triangle",
    heading: "Interfaces",
    tools: "React · TypeScript · Tailwind · Framer Motion",
    reading: "Payment surfaces at Juspay, where a dropped frame is a dropped transaction.",
  },
  {
    symbol: "diamond",
    heading: "Systems",
    tools: "Design tokens · Theming · Component libraries",
    reading: "A white-label system teams reconfigure to their own brand without forking it.",
  },
  {
    symbol: "circle",
    heading: "Mobile",
    tools: "React Native · iOS · Android",
    reading: "One codebase of business logic shared with the web, still native-feeling.",
  },
  {
    symbol: "rule",
    heading: "Underneath",
    tools: "Node · REST APIs · PureScript · CI/CD · Testing",
    reading: "Enough backend and tooling to take a feature all the way out on my own.",
  },
] as const;

/** Marginalia: the surveyor's own notes on what he is looking for. */
export const SURVEYOR_NOTES = [
  "Problems worth solving properly",
  "Systems that outlast the people who built them",
  "Teams that ship, not just plan",
  "Room to work across the whole stack",
];

export const CORRESPONDENCE = {
  standfirst:
    "Always open to a conversation about new work, or a tricky React, mobile, or backend problem.",
  links: [
    { label: "Email", value: "vinit224488@gmail.com", href: "mailto:vinit224488@gmail.com" },
    { label: "GitHub", value: "github.com/vinit717", href: "https://github.com/vinit717" },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/vinit-khandal",
      href: "https://www.linkedin.com/in/vinit-khandal/",
    },
  ],
};
