export const STORAGE_KEY_PROFILE = "oguz_travel_user_profile";

export const DEFAULT_PROFILE = {
  full_name: "Tanzir Rahman",
  role: "Senior Product Designer",
  status: "Available for hire",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  contact: {
    email: "hello@example.com",
    phone: "+993 (65) 12-34-56",
    location: "Ashgabat, Turkmenistan",
    website: "tanzir.rahman.design",
    linkedin: "linkedin.com/in/tanzir",
  },
  skills: [
    "Figma",
    "React",
    "TypeScript",
    "Design Systems",
    "UX Research",
    "Prototyping",
    "Amadeus GDS",
    "Visa Operations",
  ],
  personal_summary:
    "Results-driven product designer with 8+ years of experience building scalable design systems and user-centered experiences for enterprise SaaS platforms. Passionate about bridging the gap between design and engineering through clear documentation and collaborative workflows.",
  work_experience: [
    {
      id: "exp-1",
      role: "Senior Product Designer",
      company: "EcoAdmin",
      location: "San Francisco, CA",
      period: "Jan 2021 - Present",
      bullets: [
        "Led the redesign of the core dashboard, improving user engagement by 24%.",
        "Built and maintained a unified design system used across 5 product teams.",
        "Collaborated with engineering to ship features 30% faster through better handoff.",
      ],
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "GreenTech Labs",
      location: "Remote",
      period: "Jun 2018 - Dec 2020",
      bullets: [
        "Designed mobile-first experiences for a climate-focused consumer app.",
        "Conducted user research and synthesized findings into actionable design specs.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Fine Arts in Graphic Design",
      school: "University of California, Berkeley",
      period: "Graduated: May 2018 • GPA: 3.8/4.0",
    },
    {
      id: "edu-2",
      degree: "Certificate in Human-Computer Interaction",
      school: "Stanford University Online",
      period: "Completed: 2020",
    },
  ],
  certifications: [
    { id: "cert-1", title: "Google UX Design Certification", year: "2022" },
    { id: "cert-2", title: "Best Design System Award", year: "2021" },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "Native" },
    { id: "lang-2", name: "Turkmen", level: "Native" },
    { id: "lang-3", name: "Russian", level: "Fluent" },
    { id: "lang-4", name: "Turkish", level: "Fluent" },
  ],
  references: [
    { id: "ref-1", text: "Available upon request." },
  ],
  references_text: "Available upon request.",
};
