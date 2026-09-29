// Central brand + contact configuration for TechBuilt Open School.
// Update these values to match your real academy details before launch.

export const site = {
  name: "TechBuilt Open School",
  fullName: "TechBuilt Open School International Online Academy",
  shortName: "TechBuilt Open School",
  tagline: "International Online Academy",
  description:
    "Premium international online academy offering live tutoring and technical courses for students from Grade 5 to MS level — across Pakistan and worldwide.",
  url: "", // e.g. https://techbuiltopenschool.com (used for SEO when available)
  email: "admissions@techbuiltopenschool.com",
  phoneDisplay: "+92 329 5448590",
  // WhatsApp number in international format without "+" or spaces.
  whatsappNumber: "923295448590",
  whatsappMessage:
    "Hello TechBuilt Open School, I would like information about your courses, live batches, tutoring, or Free Demo.",
  workingHours: "Mon – Sat · 9:00 AM – 9:00 PM (PKT)",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
} as const;

export const whatsappLink = () =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`;

export const stats = [
  { value: "Live & Interactive", label: "Instructor-led online classes" },
  { value: "1-on-1 & Small Group", label: "Personalized learning attention" },
  { value: "Project-Driven", label: "Practical hands-on curriculum" },
  { value: "Free Demo", label: "Trial session available" },
] as const;
