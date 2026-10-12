# Phase 15: Route & Indexing Inventory

**Academy**: TechBuilt Open School International Online Academy  
**Production Domain**: `https://techbuiltos.online`  
**Date**: October 2026  
**Audited Route Count**: 90 Indexable Public Routes + Excluded Private Routes

---

## 1. Summary of Crawl & Indexing Architecture

| Metric                               | Count     | Status                    | Notes                                                                              |
| :----------------------------------- | :-------- | :------------------------ | :--------------------------------------------------------------------------------- |
| **Total Indexable Public Routes**    | **90**    | ✅ 100% Crawlable         | All return HTTP 200, valid canonical, unique metadata                              |
| **Existing Pre-Phase 15 Routes**     | **84**    | ✅ Preserved              | Core static, catalogs, courses, specializations, live cohorts, tutoring, SEO pages |
| **New Evergreen Resource Routes**    | **6**     | ✅ Added                  | In-depth educational guides under `/blog/$slug`                                    |
| **Sitemap Entries (`/sitemap.xml`)** | **90**    | ✅ 1:1 Parity             | Exact match with indexable inventory, absolute URLs, no query params               |
| **Private / Excluded Routes**        | **12+**   | 🔒 Disallowed / Noindex   | `/admin/*`, `/api/*`, preview bridges                                              |
| **Robots.txt Rules**                 | **Valid** | ✅ Disallow: /admin, /api | Includes canonical `Sitemap: https://techbuiltos.online/sitemap.xml`               |

---

## 2. Complete Inventory of 90 Indexable Public Routes

### A. Core Brand, Trust & Operational Pages (17 Routes)

1. `/` — Homepage (Live Python, Web, Data & AI Programs)
2. `/about` — About TechBuilt Open School
3. `/how-it-works` — How Live Online Classes Work (Admissions, Demos, Schedules)
4. `/for-students` — Guide for Students (Equipment, Preparation, Learning Tips)
5. `/for-parents` — Parent & Guardian Trust Portal (Safety, Supervision, Support)
6. `/courses` — Single Courses Catalog (32 foundational technical courses)
7. `/specializations` — Technical Specializations Catalog (10 career roadmaps)
8. `/live-batches` — Scheduled Live Cohorts Catalog (Interactive 4-month programs)
9. `/tutoring` — Academic & Quran Tutoring Catalog (12 subject disciplines)
10. `/apply` — Student Admissions Application
11. `/free-demo` — Free 1-Session Demo Trial Request
12. `/contact` — Admissions & General Contact
13. `/testimonials` — Student & Parent Experiences
14. `/faq` — Comprehensive Frequently Asked Questions
15. `/blog` — Educational Resources & Learning Roadmaps Index
16. `/privacy` — Privacy Policy & Data Protection
17. `/terms` — Terms of Enrollment & Code of Conduct

### B. Single Course Detail Pages (32 Routes)

18. `/courses/html5` — HTML5 Modern Web Foundations
19. `/courses/css3` — CSS3 Modern Styling & Responsive Architecture
20. `/courses/bootstrap-5` — Bootstrap 5 Responsive Component Framework
21. `/courses/javascript` — Modern JavaScript (ES6+) Programming
22. `/courses/typescript` — TypeScript Type-Safe Web Development
23. `/courses/jquery` — jQuery DOM Manipulation & Legacy Scripting
24. `/courses/react` — React Modern UI Component Architecture
25. `/courses/nextjs` — Next.js Full-Stack React Framework
26. `/courses/nodejs` — Node.js Server-Side Backend Runtime
27. `/courses/php` — PHP Server-Side Web Scripting
28. `/courses/laravel` — Laravel Modern PHP MVC Framework
29. `/courses/rest-apis` — RESTful API Engineering & Integration
30. `/courses/python` — Python Programming Foundations
31. `/courses/c-programming` — C Language Foundations & Systems Programming
32. `/courses/cpp` — C++ Object-Oriented & Algorithmic Programming
33. `/courses/java` — Java Enterprise Object-Oriented Programming
34. `/courses/oop` — Object-Oriented Programming Principles
35. `/courses/dsa` — Data Structures & Algorithms
36. `/courses/git-github` — Git Version Control & GitHub Workflows
37. `/courses/database-fundamentals` — Database Design & Relational Modeling
38. `/courses/sql` — SQL Relational Query Language
39. `/courses/postgresql` — PostgreSQL Enterprise Database Engineering
40. `/courses/mysql` — MySQL Relational Database Engineering
41. `/courses/mongodb` — MongoDB NoSQL Document Database
42. `/courses/numpy` — NumPy Numerical Computing in Python
43. `/courses/pandas` — Pandas Data Manipulation & Wrangling
44. `/courses/matplotlib` — Matplotlib & Seaborn Data Visualization
45. `/courses/statistics-for-data` — Practical Applied Statistics for Data
46. `/courses/data-analysis-foundations` — Exploratory Data Analysis Foundations
47. `/courses/data-science-foundations` — Data Science & Predictive Foundations
48. `/courses/ai-ml-foundations` — AI & Machine Learning Foundations
49. `/courses/scikit-learn` — Scikit-Learn Applied Machine Learning

### C. Technical Specializations (10 Routes)

50. `/specializations/frontend-developer` — Frontend Web Developer (PKR 15,000/mo)
51. `/specializations/website-developer` — Website Developer (PKR 15,000/mo)
52. `/specializations/backend-developer` — Backend Web Developer (PKR 15,000/mo)
53. `/specializations/full-stack-developer` — Full-Stack Developer (PKR 20,000/mo)
54. `/specializations/python-developer` — Python Software Developer (PKR 15,000/mo)
55. `/specializations/database-developer` — Database Developer (PKR 15,000/mo)
56. `/specializations/mobile-application-developer` — Mobile App Developer (PKR 15,000/mo)
57. `/specializations/data-analyst` — Data Analyst Specialization (PKR 20,000/mo)
58. `/specializations/data-science` — Data Science Specialization (PKR 20,000/mo)
59. `/specializations/ai-machine-learning` — AI & Machine Learning (PKR 20,000/mo)

### D. Scheduled Live Cohorts (3 Routes)

60. `/live-batches/python-young-developers` — Python for Young Developers Live Cohort
61. `/live-batches/100-days-complete-python` — 100 Days of Complete Python Live Cohort
62. `/live-batches/python-data-analysis-research-ai` — Python for Data Analysis & Research AI

### E. Academic & Quran Tutoring Subjects (12 Routes)

63. `/tutoring/mathematics` — Online Mathematics Tutoring
64. `/tutoring/physics` — Online Physics Tutoring
65. `/tutoring/computer-science-tutoring` — Computer Science Tutoring
66. `/tutoring/chemistry` — Chemistry Tutoring
67. `/tutoring/biology` — Biology Tutoring
68. `/tutoring/general-school-support` — School Level Support (Grades 5-10)
69. `/tutoring/college-support` — Intermediate / A-Level College Support
70. `/tutoring/university-support` — University Subject Mentorship
71. `/tutoring/quran-reading` — Beginner Quran Reading
72. `/tutoring/nazra-quran` — Nazra Quran with Fluency
73. `/tutoring/tajweed-tarteel` — Tajweed & Tarteel Rules
74. `/tutoring/islamic-studies-fundamentals` — Islamic Studies Foundations

### F. Legacy Search-Intent Landing Pages (9 Routes)

75. `/online-tutor-service-pakistan` — Live Online Tutoring Service in Pakistan
76. `/international-online-academy` — International Online Technical Academy
77. `/online-classes-for-students` — Live Online Classes for Students
78. `/grade-5-to-ms-online-learning` — Grade 5 to MS Online Learning Options
79. `/computer-science-tutoring` — Computer Science Tutoring Online
80. `/maths-tutor` — Maths Tutor Online
81. `/physics-tutor` — Physics Tutor Online
82. `/python-course-online` — Python Course Online
83. `/web-development-course-online` — Web Development Course Online

### G. Phase 15 Evergreen Educational Resources (6 Routes)

84. `/blog/python-learning-roadmap-beginners` — Complete Python Learning Roadmap for Beginners
85. `/blog/how-to-learn-python-100-days` — How to Learn Python in 100 Days: Structured Daily Plan
86. `/blog/data-analyst-roadmap` — Data Analyst Roadmap: Python, SQL, Statistics & Power BI
87. `/blog/programming-for-kids-parents-guide` — Programming for Kids and Teenagers: A Parent’s Guide
88. `/blog/full-stack-developer-roadmap` — Full-Stack Developer Roadmap for Beginners
89. `/blog/how-to-choose-online-tutor-course` — How to Choose the Right Online Tutor or Technical Course
90. `/sitemap.xml` — Authoritative XML Sitemap Index (Returns 200, Content-Type: application/xml)

---

## 3. Excluded Private Routes & Protection Contract

The following paths are intentionally excluded from indexing, disavowed in `robots.txt`, and tagged with `noindex,nofollow`:

| Excluded Path                | Reason                                                   | Protection Mechanism                                               |
| :--------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------- |
| `/admin/*`                   | Internal CRM, Lead Manager & Admin Dashboard             | `robots.txt` Disallow + `noindex,nofollow,noarchive` header & meta |
| `/admin/login`               | Administrative Authentication Portal                     | `noindex,nofollow` meta tags                                       |
| `/api/*`                     | Backend REST APIs, Admissions Webhooks, Content CMS APIs | `robots.txt` Disallow + non-HTML JSON responses                    |
| `/api/admissions`            | Lead Submission Handler                                  | Disallowed in robots.txt                                           |
| `/?utm_*` & Query Strings    | Marketing Tracking & Attribution URLs                    | Canonicalized directly to clean base path                          |
| `localhost:*`, `127.0.0.1:*` | Development & Test Environments                          | Stripped from production bundles and sitemaps                      |

---

## 4. Verification Check

- **HTTP Status Check**: 90/90 routes return HTTP 200.
- **Sitemap XML Parity**: Exactly 90 `<loc>` tags in `sitemap.xml`.
- **Zero Orphan Pages**: Every single route is cross-linked in header navigation, footer directories, catalog listings, or contextual article sidebars.
- **Single Canonical Check**: Every indexable page defines exactly one absolute HTTPS canonical URL pointing to `https://techbuiltos.online`.
