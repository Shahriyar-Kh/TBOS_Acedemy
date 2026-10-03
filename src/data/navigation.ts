export type NavItem = { label: string; to: string };

export const mainNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Live Batches", to: "/live-batches" },
  { label: "Specializations", to: "/specializations" },
  { label: "Tutoring", to: "/tutoring" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const footerLinks = {
  academy: [
    { label: "About Us", to: "/about" },
    { label: "Our Standards", to: "/testimonials" },
    { label: "FAQ", to: "/faq" },
    { label: "Resources", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ],
  learn: [
    { label: "All Courses", to: "/courses" },
    { label: "Live Batches", to: "/live-batches" },
    { label: "Specializations", to: "/specializations" },
    { label: "Online Tutoring", to: "/tutoring" },
    { label: "Apply Now", to: "/apply" },
  ],
  popular: [
    { label: "Online Tutor Service in Pakistan", to: "/online-tutor-service-pakistan" },
    { label: "Maths Tutor Online", to: "/maths-tutor" },
    { label: "Physics Tutor Online", to: "/physics-tutor" },
    { label: "Python Course Online", to: "/python-course-online" },
    { label: "Web Development Course", to: "/web-development-course-online" },
  ],
  legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
  ],
};
