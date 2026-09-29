export type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Ayesha Khan",
    role: "Parent of Grade 9 student",
    location: "Lahore, Pakistan",
    quote:
      "My daughter went from struggling in maths to scoring top marks in her exams. The tutors are patient, professional and genuinely care about progress. The weekly reports keep me fully informed.",
    rating: 5,
    initials: "AK",
  },
  {
    name: "Daniyal Ahmed",
    role: "Full Stack Development student",
    location: "Karachi, Pakistan",
    quote:
      "The Full Stack specialization completely changed my career path. I built real projects and now work as a junior developer. The one-to-one mentorship made all the difference.",
    rating: 5,
    initials: "DA",
  },
  {
    name: "Sarah Williams",
    role: "International student",
    location: "London, UK",
    quote:
      "Studying with TechBuilt online felt just like a premium in-person academy. Flexible timing across time zones and incredibly clear teaching. Highly recommended for overseas families.",
    rating: 5,
    initials: "SW",
  },
  {
    name: "Bilal Raza",
    role: "Computer Science student",
    location: "Islamabad, Pakistan",
    quote:
      "Concepts that confused me for years finally made sense. My tutor aligned everything to my university syllabus and prepared me perfectly for exams.",
    rating: 5,
    initials: "BR",
  },
  {
    name: "Fatima Noor",
    role: "Parent of Grade 6 student",
    location: "Dubai, UAE",
    quote:
      "Safe, professional and very well organised. The classes are engaging and my son actually looks forward to them. A truly premium learning experience.",
    rating: 5,
    initials: "FN",
  },
  {
    name: "Hamza Tariq",
    role: "Python Development student",
    location: "Faisalabad, Pakistan",
    quote:
      "From zero coding knowledge to building my own Python projects in months. The structured path and supportive tutors are world-class.",
    rating: 5,
    initials: "HT",
  },
];
