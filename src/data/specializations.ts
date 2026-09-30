export type Specialization = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  duration: string;
  level: string;
  modules: string[];
  outcomes: string[];
  careers: string[];
  icon: string;
  keywords: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export const specializations: Specialization[] = [
  // 1. Frontend Developer
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    tagline: "Craft high-performance, responsive web interfaces with modern React and Next.js.",
    summary:
      "A comprehensive frontend roadmap covering HTML, CSS, Bootstrap, JavaScript, TypeScript, React, Next.js, Git, REST APIs, and portfolio projects.",
    description:
      "This specialization teaches modern client-side software engineering. You will start with core web standards (HTML5/CSS3), master responsive UI styling with Bootstrap and modern CSS, write clean JavaScript and TypeScript, build reactive component architectures with React, and create full-stack server-rendered applications with Next.js. Guided by experienced mentors, you will integrate REST APIs, manage version control with Git, and publish a showcase portfolio.",
    duration: "6 months",
    level: "Beginner to Advanced",
    modules: [
      "Semantic HTML5 & Modern CSS3 fundamentals",
      "Responsive layout engineering with Flexbox, CSS Grid & Bootstrap",
      "Modern JavaScript (ES6+): DOM manipulation, async programming & APIs",
      "TypeScript: Static typing, interfaces, generics & compiler setup",
      "React.js: Component architecture, hooks, state management & routing",
      "Next.js: App Router, Server Components, SSR & SEO optimization",
      "Version control & team workflows with Git & GitHub",
      "REST API integration, client authentication & performance tuning",
      "Capstone: Production-grade multi-page web application portfolio",
    ],
    outcomes: [
      "Build responsive, accessible, mobile-first web user interfaces",
      "Write scalable, type-safe frontend code using TypeScript and React",
      "Deploy optimized Next.js single-page and server-rendered web applications",
      "Connect client applications seamlessly with external REST APIs",
      "Demonstrate real-world engineering through Git and live deployed projects",
    ],
    careers: ["Frontend Developer", "React Developer", "UI Engineer", "Web Application Developer"],
    icon: "Layout",
    keywords: ["frontend developer course", "learn react nextjs", "frontend roadmap"],
    featured: true,
  },

  // 2. Website Developer
  {
    slug: "website-developer",
    title: "Website Developer",
    tagline: "Design, build, and deploy modern, responsive business websites and portals.",
    summary:
      "Master practical website construction with HTML, CSS, responsive design, Bootstrap, JavaScript, forms, SEO fundamentals, and hosting.",
    description:
      "Focus on the practical, in-demand skills required to build fast, beautiful, and client-ready websites. This track takes you from visual design fundamentals and responsive layouts through interactive JavaScript components, contact forms, search engine optimization (SEO), and deploying live websites on modern hosting platforms.",
    duration: "4 months",
    level: "Beginner to Intermediate",
    modules: [
      "HTML5 page architecture, semantics & document hierarchy",
      "CSS3 styling, typography, colors & the box model",
      "Responsive design, media queries & mobile-first development",
      "Rapid UI prototyping with Bootstrap 5",
      "Interactive JavaScript: Menus, sliders, form validation & modals",
      "Website performance, image optimization & technical SEO fundamentals",
      "Git version control & GitHub Pages / Netlify / Vercel deployment",
      "Domain setup, hosting configuration & SSL essentials",
      "Capstone: Custom multi-page business website with interactive forms",
    ],
    outcomes: [
      "Design and code clean, multi-page business and agency websites",
      "Ensure flawless responsiveness across mobile, tablet, and desktop screens",
      "Implement client-side validation, contact workflows, and interactive UI widgets",
      "Apply SEO best practices to ensure discoverability by search engines",
      "Deploy and manage live websites on production hosting environments",
    ],
    careers: ["Website Developer", "Web Designer", "Freelance Web Developer", "Junior Web Specialist"],
    icon: "Globe",
    keywords: ["website developer course", "learn web design", "build business websites"],
    featured: true,
  },

  // 3. Backend Developer
  {
    slug: "backend-developer",
    title: "Backend Developer",
    tagline: "Engineer robust server architectures, scalable REST APIs, and secure database services.",
    summary:
      "Master Python server-side programming, OOP, DSA, SQL, PostgreSQL, REST APIs, Django, FastAPI, authentication, and deployment.",
    description:
      "Behind every great app is a secure, high-performance backend. This specialization equips you to design robust application backends using Python. You will cover object-oriented design, algorithmic foundations, relational databases with SQL and PostgreSQL, building RESTful APIs with Django REST Framework (DRF) and FastAPI, JWT authentication, unit testing, and production deployment.",
    duration: "6 months",
    level: "Intermediate",
    modules: [
      "Core Python engineering, standard library & clean code practices",
      "Object-Oriented Programming (OOP) & SOLID design principles",
      "Data Structures & Algorithms (DSA) foundations for backends",
      "Relational databases: SQL queries, schema design & PostgreSQL",
      "HTTP protocol, RESTful API architecture & Postman testing",
      "Django framework & Django REST Framework (DRF) API development",
      "High-performance asynchronous APIs with FastAPI",
      "User authentication (JWT, sessions), password security & CORS",
      "Automated testing, error logging & cloud deployment fundamentals",
      "Capstone: Production-ready REST API service with auth and relational database",
    ],
    outcomes: [
      "Design and implement scalable RESTful APIs with Django REST Framework and FastAPI",
      "Model, migrate, index, and query complex relational databases using PostgreSQL",
      "Implement secure authentication, authorization, and data validation layers",
      "Write modular, testable backend code adhering to industry software patterns",
      "Deploy and configure backend web services on cloud servers",
    ],
    careers: ["Backend Developer", "Python Backend Engineer", "API Developer", "Software Engineer"],
    icon: "Server",
    keywords: ["backend developer course", "python backend roadmap", "django fastapi api"],
    featured: true,
  },

  // 4. Full-Stack Developer
  {
    slug: "full-stack-developer",
    title: "Full-Stack Developer",
    tagline: "Build complete, production-grade applications from modern frontend to scalable backend.",
    summary:
      "The complete end-to-end pathway: HTML, CSS, Bootstrap, JavaScript, TypeScript, React, Next.js, Python, Django, DRF, PostgreSQL, and DevOps basics.",
    description:
      "Our flagship engineering specialization covers the entire software stack. You will master both sides of modern web development: crafting interactive, responsive user interfaces with TypeScript, React, and Next.js, and architecting robust, secure server backends using Python, Django, DRF, and PostgreSQL. Mentored by industry developers, you will complete an end-to-end full-stack capstone project.",
    duration: "8 months",
    level: "Beginner to Advanced",
    modules: [
      "Web standards: HTML5, CSS3, Flexbox, Grid & Bootstrap",
      "JavaScript (ES6+) & TypeScript: Programming logic & static typing",
      "React.js frontend development: Component state, hooks & routing",
      "Next.js full-stack capabilities: Server components & SSR",
      "Core Python, OOP & backend software fundamentals",
      "Relational databases: SQL modeling, constraints & PostgreSQL",
      "REST API engineering with Django & Django REST Framework (DRF)",
      "Authentication systems: JWT tokens, role-based access & security",
      "Full-stack integration: Connecting React/Next frontend with Python APIs",
      "Git workflows, CI/CD introduction & cloud deployment",
      "Capstone: Full-scale SaaS web application built and deployed end to end",
    ],
    outcomes: [
      "Architect and ship full-scale web applications from scratch to deployment",
      "Build polished, type-safe reactive user interfaces with React and Next.js",
      "Develop secure, high-throughput REST APIs using Python and Django",
      "Design normalized relational schemas and optimize queries with PostgreSQL",
      "Manage version control, deployment pipelines, and environment configs",
    ],
    careers: ["Full-Stack Developer", "Software Engineer", "Web Application Engineer"],
    icon: "Layers",
    keywords: ["full stack developer course", "full stack python react", "web engineering"],
    featured: true,
  },

  // 5. Python Developer
  {
    slug: "python-developer",
    title: "Python Developer",
    tagline: "Master Python programming for web backends, automation scripts, and database tools.",
    summary:
      "Go from core Python syntax and OOP to DSA, SQL, PostgreSQL, REST concepts, automated scripting, FastAPI, and Django.",
    description:
      "Python is the most versatile programming language in the industry. This track takes you from foundational programming through advanced OOP, data structures, file handling, automation, working with relational databases, and building modern web services with FastAPI and Django.",
    duration: "5 months",
    level: "Beginner to Intermediate",
    modules: [
      "Python core: Syntax, data types, control structures & comprehension",
      "Object-Oriented Programming (OOP): Classes, inheritance & design patterns",
      "Data Structures & Algorithms: Lists, dicts, stacks, queues & recursion",
      "File processing: Working with CSV, JSON, XML & standard libraries",
      "Task automation & scripting: Web scraping, OS modules & scheduling",
      "Database integration: SQL fundamentals & PostgreSQL with psycopg2/SQLAlchemy",
      "RESTful API development with FastAPI",
      "Introduction to Django web framework architecture",
      "Unit testing with pytest, debugging & virtual environments",
      "Capstone: Practical multi-module Python automation & web API project",
    ],
    outcomes: [
      "Write professional, idiomatic, PEP 8 compliant Python code",
      "Build automated data processing and systems scripting utilities",
      "Design and query databases using SQL and ORM tools in Python",
      "Develop lightweight, high-speed RESTful web services using FastAPI",
      "Structure and test maintainable Python projects with pytest",
    ],
    careers: ["Python Developer", "Software Developer", "Automation Engineer"],
    icon: "Terminal",
    keywords: ["python developer course", "learn python development", "python automation"],
    featured: true,
  },

  // 6. Database Developer
  {
    slug: "database-developer",
    title: "Database Developer",
    tagline: "Design, query, optimize, and administer relational and document database architectures.",
    summary:
      "Comprehensive database track covering modeling, SQL, MySQL, PostgreSQL, normalization, indexes, transactions, and MongoDB/NoSQL.",
    description:
      "Data is the foundation of modern technology. This specialization trains developers in professional data architecture. You will master Entity-Relationship modeling, advanced SQL queries, relational database management with MySQL and PostgreSQL, performance tuning with indexes, transactions and concurrency, stored views, NoSQL document modeling with MongoDB, and integrating databases with application code.",
    duration: "5 months",
    level: "Intermediate",
    modules: [
      "Database fundamentals: File systems vs. DBMS, relational theory & ACID",
      "Entity-Relationship Modeling (ERD), entities, cardinalities & domain rules",
      "Normalization theory: 1NF, 2NF, 3NF & eliminating data anomalies",
      "Advanced SQL: Multi-table JOINs, subqueries, CTEs & window functions",
      "PostgreSQL administration, advanced data types (JSONB) & query plans (EXPLAIN)",
      "MySQL administration, table engines (InnoDB), constraints & user security",
      "Database indexing: B-Tree, GIN, composite indexes & query optimization",
      "Transactions, isolation levels, locking mechanisms & data integrity",
      "NoSQL document architecture with MongoDB: Collections, CRUD & Aggregations",
      "Backup strategies, disaster recovery concepts & application connection pooling",
      "Capstone: Enterprise-grade database architecture, schemas & migration scripts",
    ],
    outcomes: [
      "Design normalized, high-performance relational database schemas",
      "Write complex, optimized SQL queries and analyze execution plans",
      "Administer and configure MySQL and PostgreSQL production instances",
      "Model and query semi-structured data with MongoDB and PostgreSQL JSONB",
      "Ensure transactional data integrity and implement robust indexing strategies",
    ],
    careers: ["Database Developer", "SQL Developer", "Database Administrator (Junior)", "Data Engineer (Junior)"],
    icon: "Database",
    keywords: ["database developer course", "sql developer roadmap", "postgresql mysql nosql"],
  },

  // 7. Mobile Application Developer
  {
    slug: "mobile-application-developer",
    title: "Mobile Application Developer",
    tagline: "Build native-feeling iOS and Android mobile applications using React Native.",
    summary:
      "Learn cross-platform mobile development with JavaScript, TypeScript, React fundamentals, React Native, navigation, state, APIs, and device features.",
    description:
      "Cross-platform mobile development allows you to ship apps to both iOS and Android from a single codebase. In this track, you learn modern JavaScript and TypeScript, core React declarative UI principles, React Native components, React Navigation, local offline storage, integrating camera and device APIs, connecting with REST backends, and app build/release fundamentals.",
    duration: "5 months",
    level: "Intermediate",
    modules: [
      "Mobile development paradigms: Native vs. Cross-platform overview",
      "JavaScript (ES6+) & TypeScript for mobile development",
      "React fundamentals: Components, JSX, props & hooks",
      "React Native core components: View, Text, ScrollView, FlatList, StyleSheet",
      "Mobile navigation patterns with React Navigation (Stack, Tab, Drawer)",
      "State management in mobile apps & managing user inputs/forms",
      "Connecting mobile apps to REST APIs, handling network states & caching",
      "Offline persistence with Async Storage / SQLite mobile storage",
      "Device APIs: Camera, geolocation & push notifications overview",
      "Debugging, testing with Jest & preparing release builds (APK / bundle)",
      "Capstone: Complete cross-platform mobile application with live API integration",
    ],
    outcomes: [
      "Build cross-platform mobile applications for Android and iOS using React Native",
      "Implement multi-screen navigation, fluid touch interactions, and native styling",
      "Connect mobile apps to cloud REST APIs with secure authentication tokens",
      "Manage local offline storage and cache dynamic data smoothly",
      "Prepare, bundle, and test mobile applications for app store distribution",
    ],
    careers: ["Mobile Application Developer", "React Native Developer", "Cross-Platform App Developer"],
    icon: "Smartphone",
    keywords: ["mobile app developer course", "react native course", "cross platform mobile development"],
  },

  // 8. Data Analyst
  {
    slug: "data-analyst",
    title: "Data Analyst",
    tagline: "Turn raw business and research data into actionable visual insights and metrics.",
    summary:
      "Master analytical workflows with Python, NumPy, Pandas, SQL, data cleaning, statistical analysis, Matplotlib, visualization, and EDA.",
    description:
      "Data analysts bridge the gap between numbers and informed decisions. This applied specialization equips you with the complete analytical toolkit: querying databases with SQL, wrangling and cleaning real-world datasets with Python and Pandas, applying statistical analysis, creating publication-ready visualizations with Matplotlib/Seaborn, and conducting deep exploratory data analysis (EDA) to produce executive findings.",
    duration: "5 months",
    level: "Beginner to Intermediate",
    modules: [
      "The analytical process: Formulating questions & metrics framework",
      "SQL for data analysis: Querying, filtering, aggregations, JOINs & CTEs",
      "Python for analytics: Core syntax, data structures & environment setup",
      "Numerical operations and array fundamentals with NumPy",
      "Data manipulation & cleaning with Pandas (Series, DataFrames, Missing data)",
      "Applied statistics: Measures of central tendency, spread, correlation & distributions",
      "Data visualization: Chart selection, formatting & Matplotlib/Seaborn dashboards",
      "Exploratory Data Analysis (EDA): Spotting trends, anomalies & relationships",
      "Business intelligence metrics, KPI calculations & reporting frameworks",
      "Capstone: Comprehensive data analysis report on real business or research datasets",
    ],
    outcomes: [
      "Extract, join, and aggregate tabular data efficiently using SQL",
      "Clean, reshape, and transform messy real-world datasets using Pandas",
      "Compute descriptive and inferential statistics to validate hypotheses",
      "Create clear, compelling visual chart dashboards for decision-makers",
      "Deliver professional exploratory analysis reports with actionable conclusions",
    ],
    careers: ["Data Analyst", "Business Intelligence Analyst", "Research Data Analyst", "Operations Analyst"],
    icon: "BarChart3",
    keywords: ["data analyst course", "learn data analysis python sql", "data analytics roadmap"],
    featured: true,
  },

  // 9. Data Science
  {
    slug: "data-science",
    title: "Data Science",
    tagline: "Explore the complete data science lifecycle from statistical analysis to predictive modeling.",
    summary:
      "A rigorous path through Python, NumPy, Pandas, SQL, probability, statistics, EDA, feature engineering, and scikit-learn machine learning.",
    description:
      "Data science uncovers hidden patterns and builds predictive capability. This specialization covers the complete data science methodology: structured querying with SQL, advanced data wrangling with Pandas, probability and statistical hypothesis testing, exploratory data visualization, feature engineering, and training supervised and unsupervised machine learning models with scikit-learn.",
    duration: "6 months",
    level: "Intermediate",
    modules: [
      "Python for data science & scientific computing environment",
      "Relational querying and data extraction with SQL",
      "Numerical computing with NumPy & data wrangling with Pandas",
      "Probability foundations, distributions & Central Limit Theorem",
      "Statistical hypothesis testing: t-tests, ANOVA, Chi-Square & p-values",
      "Exploratory Data Analysis (EDA) and data visualization with Seaborn",
      "Feature engineering: Encoding, scaling, outlier handling & imputation",
      "Supervised learning: Linear Regression, Logistic Regression, Decision Trees",
      "Model evaluation: Cross-validation, confusion matrices, ROC-AUC, RMSE",
      "Unsupervised learning: K-Means clustering & PCA dimensionality reduction",
      "Capstone: End-to-end data science project from raw data to predictive model evaluation",
    ],
    outcomes: [
      "Perform thorough exploratory data analysis and feature engineering on complex datasets",
      "Apply probability and inferential statistics to test data-driven hypotheses",
      "Train, validate, and tune predictive machine learning models using scikit-learn",
      "Evaluate models objectively against real-world test sets using standard metrics",
      "Document and present complete reproducible data science workflows",
    ],
    careers: ["Data Scientist (Junior)", "Machine Learning Analyst", "Quantitative Analyst"],
    icon: "PieChart",
    keywords: ["data science course", "learn data science python", "machine learning statistics"],
    featured: true,
  },

  // 10. AI / Machine Learning
  {
    slug: "ai-machine-learning",
    title: "AI / Machine Learning",
    tagline: "Build, evaluate, and deploy practical machine learning models and AI pipelines.",
    summary:
      "Master ML fundamentals: Python, NumPy, Pandas, statistics, regression, classification, clustering, scikit-learn, evaluation, model serving, and AI API integration.",
    description:
      "Demystify Artificial Intelligence and Machine Learning through rigorous, practical training. This specialization focuses on foundational ML algorithms: linear models, decision trees, ensemble methods (Random Forests), clustering, hyperparameter optimization with scikit-learn, model evaluation, serialization, model serving concepts, an orientation to modern AI APIs, and deep learning architectural principles.",
    duration: "6 months",
    level: "Intermediate to Advanced",
    modules: [
      "Python scientific stack: NumPy vectorization & Pandas data pipelines",
      "Mathematical foundations: Linear algebra, calculus intuition & statistics",
      "Machine learning workflow: Problem framing, data splitting & leakage prevention",
      "Supervised regression: Linear, Ridge, Lasso & evaluation metrics (MAE, RMSE, R²)",
      "Supervised classification: Logistic regression, SVMs, Decision Trees & Random Forests",
      "Classification metrics: Precision, Recall, F1-score, ROC-AUC & confusion matrix",
      "Unsupervised learning: K-Means clustering & PCA dimensionality reduction",
      "Model tuning: Grid search, randomized search & cross-validation",
      "Model persistence (Joblib) & building inference REST endpoints",
      "Modern AI API integration concepts & deep learning foundational orientation",
      "Capstone: Production-ready machine learning pipeline with live inference demonstration",
    ],
    outcomes: [
      "Understand the algorithmic mechanics and math behind core machine learning models",
      "Train, tune, and evaluate robust classification and regression pipelines with scikit-learn",
      "Prevent data leakage and overfitting using rigorous cross-validation workflows",
      "Save and serve trained models via clean Python API endpoints",
      "Integrate external AI APIs and understand neural network foundational concepts",
    ],
    careers: ["Machine Learning Engineer (Junior)", "AI Developer", "Data Scientist", "Applied ML Specialist"],
    icon: "Bot",
    keywords: ["ai machine learning course", "learn machine learning python", "scikit learn ml roadmap"],
    featured: true,
  },
];

export const getSpecialization = (slug: string) =>
  specializations.find((s) => s.slug === slug);
export const featuredSpecializations = specializations.filter((s) => s.featured);
