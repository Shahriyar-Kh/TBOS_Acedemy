export interface CourseCurriculumSource {
  label: string;
  url: string;
}

const mdnHtml = {
  label: "MDN HTML Guide",
  url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
};
const mdnCss = { label: "MDN CSS Guide", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" };
const mdnJavaScript = {
  label: "MDN JavaScript Guide",
  url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
};
const pythonTutorial = {
  label: "Official Python Tutorial",
  url: "https://docs.python.org/3/tutorial/",
};
const postgresqlTutorial = {
  label: "PostgreSQL Official Tutorial",
  url: "https://www.postgresql.org/docs/current/tutorial.html",
};
const pandasGuide = {
  label: "pandas User Guide",
  url: "https://pandas.pydata.org/docs/user_guide/",
};
const numpyGuide = {
  label: "NumPy User Guide",
  url: "https://numpy.org/doc/stable/user/",
};
const scikitGuide = {
  label: "scikit-learn User Guide",
  url: "https://scikit-learn.org/stable/user_guide.html",
};

/**
 * Primary curriculum references used to validate each public single-course
 * roadmap. Technology-vendor documentation is preferred; standards and
 * academic references are used where a single vendor specification does not
 * exist (for example DSA and statistics).
 */
export const courseCurriculumSources: Record<string, CourseCurriculumSource[]> = {
  html5: [mdnHtml],
  css3: [mdnCss],
  "bootstrap-5": [
    {
      label: "Bootstrap 5 Documentation",
      url: "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
    },
  ],
  javascript: [mdnJavaScript],
  typescript: [
    {
      label: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    },
  ],
  jquery: [
    { label: "jQuery Learning Center", url: "https://learn.jquery.com/" },
    { label: "jQuery API", url: "https://api.jquery.com/" },
  ],
  react: [{ label: "React Learn", url: "https://react.dev/learn" }],
  nextjs: [{ label: "Next.js App Router Documentation", url: "https://nextjs.org/docs/app" }],
  nodejs: [{ label: "Node.js Learn", url: "https://nodejs.org/en/learn" }],
  php: [{ label: "PHP Manual", url: "https://www.php.net/manual/en/" }],
  laravel: [{ label: "Laravel Documentation", url: "https://laravel.com/docs" }],
  "rest-apis": [
    { label: "MDN HTTP Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
    {
      label: "OpenAPI Specification",
      url: "https://spec.openapis.org/oas/latest.html",
    },
  ],
  python: [pythonTutorial],
  "c-programming": [
    {
      label: "GNU C Language Manual",
      url: "https://www.gnu.org/software/c-intro-and-ref/manual/",
    },
  ],
  cpp: [{ label: "Standard C++ Foundation", url: "https://isocpp.org/get-started" }],
  java: [{ label: "Dev.java Learn", url: "https://dev.java/learn/" }],
  oop: [
    {
      label: "Python Classes Tutorial",
      url: "https://docs.python.org/3/tutorial/classes.html",
    },
    { label: "Java OOP Guide", url: "https://dev.java/learn/oop/" },
  ],
  dsa: [{ label: "OpenDSA", url: "https://opendsa.org/" }],
  "git-github": [
    { label: "Git Reference & Guides", url: "https://git-scm.com/docs" },
    { label: "GitHub Documentation", url: "https://docs.github.com/en" },
  ],
  "database-fundamentals": [postgresqlTutorial],
  sql: [
    {
      label: "PostgreSQL SQL Language",
      url: "https://www.postgresql.org/docs/current/sql.html",
    },
  ],
  postgresql: [
    {
      label: "PostgreSQL Official Documentation",
      url: "https://www.postgresql.org/docs/current/",
    },
  ],
  mysql: [
    {
      label: "MySQL Official Tutorial",
      url: "https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/",
    },
  ],
  mongodb: [
    {
      label: "MongoDB Database Manual",
      url: "https://www.mongodb.com/docs/manual/",
    },
  ],
  numpy: [numpyGuide],
  pandas: [pandasGuide],
  matplotlib: [
    {
      label: "Matplotlib Tutorials",
      url: "https://matplotlib.org/stable/tutorials/index.html",
    },
  ],
  "statistics-for-data": [
    {
      label: "NIST Statistics Handbook",
      url: "https://www.itl.nist.gov/div898/handbook/",
    },
  ],
  "data-analysis-foundations": [pandasGuide, postgresqlTutorial],
  "data-science-foundations": [numpyGuide, pandasGuide, scikitGuide],
  "ai-ml-foundations": [
    {
      label: "Google Machine Learning Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
    scikitGuide,
  ],
  "scikit-learn": [scikitGuide],
};

export function getCourseCurriculumSources(slug: string): CourseCurriculumSource[] {
  return courseCurriculumSources[slug] ?? [];
}
