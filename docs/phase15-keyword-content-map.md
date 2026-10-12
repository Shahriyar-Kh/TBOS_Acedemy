# Phase 15: Keyword & Search-Intent Architecture Map

**Academy**: TechBuilt Open School International Online Academy  
**Production Domain**: `https://techbuiltos.online`  
**Intent Philosophy**: People-first, evidence-based keyword architecture without doorway pages, fake locations, or keyword stuffing.

---

## 1. Search-Intent Strategy & Governance

1. **One Primary Intent per Page**: Prevents keyword cannibalization where multiple pages compete against each other for the same query.
2. **Honest Delivery Context**: Online classes delivered live via Zoom/Google Meet. No false claims of physical campuses or offline centers.
3. **Geographic Honesty**: Target learners in Pakistan and abroad without claiming unverified enrollment locations; emphasize that instruction is delivered online.
4. **Commercial Transparency**: Honest mentions of actual tuition (PKR 20k/15k monthly for specializations), 1-session Free Demo, and admissions schedule review.

---

## 2. Priority Route Keyword & Intent Architecture

### Page 1: Homepage (`/`)

- **Page Type**: Primary Brand & Catalog Portal
- **Target Audience**: Students, parents, career changers, and working professionals seeking structured online technical education.
- **Primary Search Intent**: "Online technical coding academy" / "live computer courses online"
- **Supporting Search Intent**: "Python and web development online classes", "international online academy pakistan"
- **Title**: `TechBuilt Open School | Live Python, Web, Data & AI Programs`
- **Description**: `Live, instructor-led online programs in Python, web development, data analysis and AI/ML foundations — practical project-driven roadmaps for learners across Pakistan and worldwide.`
- **Internal-Link Sources**: Header logo, footer brand link, all breadcrumb root links.
- **Conversion Destination**: `/free-demo`, `/apply`, `/courses`, `/specializations`.

---

### Page 2: Courses Catalog (`/courses`)

- **Page Type**: Modular Technical Catalog
- **Target Audience**: Self-directed learners looking for specific skill foundations (Python, SQL, React, etc.).
- **Primary Search Intent**: "Technical programming courses online"
- **Supporting Search Intent**: "individual coding courses", "learn python sql javascript online"
- **Title**: `Explore 32 Technical Courses | TechBuilt Open School`
- **Description**: `Browse 32 foundational technical courses across programming, web development, databases, and data science with live mentorship and project work.`
- **Internal-Link Sources**: Main navigation menu, footer catalog strip, blog articles sidebar.
- **Conversion Destination**: `/courses/$slug`, `/apply?type=Single+Course`.

---

### Page 3: Python Course Detail (`/courses/python`)

- **Page Type**: Individual Course Page
- **Target Audience**: Complete beginners, university undergraduates, and school students starting to program.
- **Primary Search Intent**: "Python programming course online"
- **Supporting Search Intent**: "learn python with live tutor", "python beginner course pakistan", "interactive python classes"
- **Title**: `Python Programming Course Online | TechBuilt Open School`
- **Description**: `Learn Python programming with live online instruction, hands-on exercises, OOP principles, and real-world project development.`
- **Internal-Link Sources**: `/courses`, `/blog/python-learning-roadmap-beginners`, `/blog/how-to-learn-python-100-days`, homepage catalog grid.
- **Conversion Destination**: `/apply?type=Single+Course&selected=Python`, `/free-demo?type=Single+Course&selected=Python`.

---

### Page 4: Specializations Catalog (`/specializations`)

- **Page Type**: Career Pathway Directory
- **Target Audience**: Career transitioners and serious learners seeking comprehensive end-to-end multi-course roadmaps.
- **Primary Search Intent**: "Software development specializations online"
- **Supporting Search Intent**: "full stack web development training", "data analyst career roadmap"
- **Title**: `10 Career Specializations | TechBuilt Open School`
- **Description**: `Explore 10 structured multi-course specializations in full-stack engineering, data analytics, AI/ML, and mobile app development.`
- **Internal-Link Sources**: Main navigation, footer, resource articles.
- **Conversion Destination**: `/specializations/$slug`, `/apply?type=Specialization`.

---

### Page 5: Full-Stack Developer Specialization (`/specializations/full-stack-developer`)

- **Page Type**: Premium Specialization Page
- **Target Audience**: Aspiring professional software engineers wanting frontend, backend, databases, and deployment.
- **Primary Search Intent**: "Full stack developer course online"
- **Supporting Search Intent**: "mern stack course pakistan", "react nodejs career track", "learn full stack development"
- **Title**: `Full-Stack Developer Specialization | TechBuilt Open School`
- **Description**: `Master modern web development from HTML, CSS and React to Node.js, databases, and cloud deployment with 4 live classes per week.`
- **Internal-Link Sources**: `/specializations`, `/blog/full-stack-developer-roadmap`, homepage feature card.
- **Conversion Destination**: `/apply?type=Specialization&selected=Full-Stack+Developer` (PKR 20,000/month).

---

### Page 6: Data Analyst Specialization (`/specializations/data-analyst`)

- **Page Type**: Premium Specialization Page
- **Target Audience**: Aspiring business analysts, graduates, and professionals wanting quantitative skills.
- **Primary Search Intent**: "Data analyst course online"
- **Supporting Search Intent**: "python sql power bi training", "data analytics roadmap pakistan"
- **Title**: `Data Analyst Specialization | TechBuilt Open School`
- **Description**: `Become a skilled data analyst: master relational SQL, Python data wrangling (Pandas/NumPy), statistics, and Power BI dashboards.`
- **Internal-Link Sources**: `/specializations`, `/blog/data-analyst-roadmap`, `/courses/sql`.
- **Conversion Destination**: `/apply?type=Specialization&selected=Data+Analyst` (PKR 20,000/month).

---

### Page 7: Live Batches Catalog (`/live-batches`)

- **Page Type**: Cohort Schedule Directory
- **Target Audience**: Learners who thrive in interactive cohort environments with scheduled class times and peer collaboration.
- **Primary Search Intent**: "Live online coding batches"
- **Supporting Search Intent**: "scheduled online programming cohorts", "interactive live coding classes"
- **Title**: `Live Online Batches & Cohorts | TechBuilt Open School`
- **Description**: `Explore scheduled live cohorts with program-specific weekly class frequency, hands-on projects, and instructor guidance.`
- **Internal-Link Sources**: Header navigation, homepage live banner, footer.
- **Conversion Destination**: `/live-batches/$slug`, `/free-demo`.

---

### Page 8: 100 Days Complete Python Cohort (`/live-batches/100-days-complete-python`)

- **Page Type**: Live Cohort Detail Page
- **Target Audience**: Learners committing to a structured 100-day programming routine.
- **Primary Search Intent**: "100 days of code python cohort"
- **Supporting Search Intent**: "100 days complete python live classes", "python cohort mentorship"
- **Title**: `100 Days of Complete Python Live Cohort | TechBuilt Open School`
- **Description**: `A structured 100-day live cohort covering Python syntax, data structures, OOP, web APIs, and portfolio projects with 3–4 classes per week.`
- **Internal-Link Sources**: `/live-batches`, `/blog/how-to-learn-python-100-days`, `/courses/python`.
- **Conversion Destination**: `/apply?type=Live+Batch&selected=100-days-complete-python`, `/free-demo`.

---

### Page 9: Tutoring Catalog (`/tutoring`)

- **Page Type**: Academic & Islamic Mentorship Directory
- **Target Audience**: School, college, university students, and parents seeking 1-on-1 tutoring.
- **Primary Search Intent**: "Online tutoring service pakistan"
- **Supporting Search Intent**: "online home tutor maths physics cs", "quran teacher online"
- **Title**: `Online Tutoring Service | Academic & Quran Tutoring | TechBuilt Open School`
- **Description**: `Live online tutoring options for school, college, university, Quran and Islamic Studies learners. One-to-one and small-group formats are available subject to tutor scheduling.`
- **Internal-Link Sources**: Header navigation, footer directory, parent portal.
- **Conversion Destination**: `/tutoring/$slug`, `/free-demo?type=Academic+Tutoring`.

---

### Page 10: Computer Science Tutoring (`/tutoring/computer-science-tutoring`)

- **Page Type**: Academic Tutoring Detail
- **Target Audience**: IGCSE, O/A-Level, Matric, FSc, and undergraduate computer science students.
- **Primary Search Intent**: "Computer science tutor online"
- **Supporting Search Intent**: "o level computer science tuition", "a level cs tutor pakistan"
- **Title**: `Computer Science Tutoring Online | TechBuilt Open School`
- **Description**: `Live online computer science tutoring for school, college and university learners, with syllabus coverage and tutor availability confirmed before enrollment.`
- **Internal-Link Sources**: `/tutoring`, `/for-parents`, `/blog/programming-for-kids-parents-guide`.
- **Conversion Destination**: `/free-demo?type=Academic+Tutoring&selected=Computer+Science`.

---

### Page 11: Evergreen Resource — Python Roadmap (`/blog/python-learning-roadmap-beginners`)

- **Page Type**: High-Authority Educational Resource
- **Target Audience**: Total beginners researching how to start programming with Python.
- **Primary Search Intent**: "Complete python learning roadmap for beginners"
- **Supporting Search Intent**: "how to start learning python", "python beginner study guide 2026"
- **Title**: `Complete Python Learning Roadmap for Beginners | TechBuilt Open School`
- **Description**: `A structured, step-by-step roadmap to learn Python programming from zero: syntax, data structures, object-oriented programming, real projects and specializations.`
- **Internal-Link Sources**: `/blog`, `/courses/python`, footer resources strip.
- **Conversion Destination**: `/free-demo`, `/courses/python`, `/live-batches/100-days-complete-python`.

---

### Page 12: Evergreen Resource — Kids Coding Parent Guide (`/blog/programming-for-kids-parents-guide`)

- **Page Type**: Parent Guidance Resource
- **Target Audience**: Parents and guardians evaluating computer education for their children.
- **Primary Search Intent**: "Programming for kids parents guide"
- **Supporting Search Intent**: "how to teach kids coding", "coding classes for teenagers benefits"
- **Title**: `Programming for Kids and Teenagers: A Parent’s Guide | TBOS`
- **Description**: `A complete guide for parents on helping kids and teens learn programming: cognitive benefits, age-appropriate paths, screen time balance, and live mentoring.`
- **Internal-Link Sources**: `/blog`, `/for-parents`, `/live-batches/python-young-developers`.
- **Conversion Destination**: `/free-demo`, `/live-batches/python-young-developers`, `/for-parents`.
