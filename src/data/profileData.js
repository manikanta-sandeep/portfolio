export const siteConfig = {
  siteName: "Sandeep Puppala",
  siteUrl: "https://sandeeppuppala.com",
  // Title of the home page: the name first, since that is what people search for.
  homeTitle: "Sandeep Puppala | Software Engineer, NYU M.S. Computer Science",
  defaultDescription:
    "Sandeep Puppala (Bala Sai Manikanta Sandeep Puppala) is a software engineer and M.S. Computer Science student at New York University, formerly at Storable India. Projects, experience, skills, and writing.",
  // Other forms of the name people may search for. Used only in structured data for search engines.
  alternateNames: [
    "Bala Sai Manikanta Sandeep Puppala",
    "Manikanta Sandeep Puppala",
    "Manikanta Puppala",
    "Manikanta Sandeep",
    "Sandeep Puppala NYU",
    "Puppala Sandeep",
    "Puppala Bala Sai Manikanta Sandeep",
    "Bala Sai Manikanta Sandeep"
  ],
  socialImage: "https://sandeeppuppala.com/social-preview.jpg",
  locale: "en_US"
};

// Initial content. The API seeds its database from this file on first start, and the site
// falls back to it when the API is unreachable. Once the site is running, edit content in /admin.
// Last synced with SP_Resume.pdf (Nov 2026).
export const profileData = {
  fullName: "Bala Sai Manikanta Sandeep Puppala",
  displayName: "Sandeep Puppala",
  initials: "SP",
  // Shown next to the name in the sidebar when set, e.g. "(they/them)".
  pronouns: "",
  role: "Software Engineer",
  headline: "Software Engineer | M.S. Computer Science",
  organizationName: "New York University",
  organizationUrl: "https://www.nyu.edu/",
  // URL of a headshot (upload one in /admin). Initials are shown when empty.
  photo: "/profile.jpg",
  location: "New York, NY",
  summary:
    "Software Engineer and M.S. Computer Science student at New York University, with over two years at Storable India building AI-driven product features, CMS platforms, and micro-frontend architecture.",
  email: "puppala.san@gmail.com",
  linkedin: "https://www.linkedin.com/in/manikantapuppala/",
  github: "https://github.com/manikanta-sandeep",
  resumeFile: "/SP_Resume.pdf",
  availability: "Open to software engineering opportunities and graduate research collaboration.",
  tagline: "Software engineering, AI-driven product features, and technical writing.",
  responseTime: "24-48 hours",
  // Markdown: blank lines separate paragraphs, lines starting with "- " form a list.
  interests: `At Storable India I built user-facing systems and internal tooling: an AI-powered chatbot that generates structured page sections, a micro-frontend integration that rolled an improved UI out across 600+ facilities, and zero-downtime PostgreSQL migrations on production tables. I am now pursuing an M.S. in Computer Science at New York University.

My technical experience spans:

- AI agents and prompt engineering for features that return structured JSON, with guardrails for response validation
- React, Redux, and GraphQL front ends for CMS platforms on the MERN stack
- Micro-frontend architecture and large framework upgrades
- PostgreSQL schema migrations and cloud services on AWS (S3, Bedrock)

I am also interested in operations research and mathematical modeling, from my work on a two-warehouse inventory model for deteriorating items.

I enjoy exploring new technologies and keeping up with industry trends. Open to software engineering opportunities and graduate research collaboration. Please reach out to collaborate.`,
  interestTags: ["AI Agents", "Frontend Architecture", "Developer Tooling", "Cloud", "Operations Research"],
  // level is one of Expert, Advanced, Intermediate, Beginner and drives the proficiency bar.
  // Skills without a level or years still appear; the bar and years are simply omitted.
  skills: [
    {
      name: "React",
      category: "Web & Backend",
      featured: true,
      description:
        "CMS UI on the MERN stack supporting nearly 5,000 websites, including a react-bootstrap 0.32 to 2.9 and bootstrap 3 to 5 upgrade."
    },
    {
      name: "AI Agents",
      category: "AI & ML",
      featured: true,
      description:
        "An AI-powered chatbot that generates structured JSON for dynamic section rendering, with guardrails for response validation, cutting section creation from over two hours to under a minute."
    },
    {
      name: "JavaScript",
      category: "Programming",
      featured: true,
      description: "Micro-frontend architecture integrating two web applications into a CMS deployed across 600+ facilities."
    },
    { name: "Python", category: "Programming" },
    { name: "Java", category: "Programming" },
    { name: "C", category: "Programming" },
    { name: "Bash Scripting", category: "Programming" },
    { name: "OOP & DSA", category: "Programming" },
    { name: "Redux", category: "Web & Backend" },
    { name: "GraphQL", category: "Web & Backend" },
    { name: "MERN Stack", category: "Web & Backend" },
    { name: "REST APIs", category: "Web & Backend" },
    { name: "Micro-Frontend Architecture", category: "Web & Backend" },
    { name: "Node.js", category: "Web & Backend" },
    { name: "Prompt Engineering", category: "AI & ML" },
    { name: "Scikit-learn", category: "AI & ML" },
    { name: "CNNs", category: "AI & ML" },
    { name: "Flask", category: "AI & ML" },
    { name: "Pandas", category: "AI & ML" },
    { name: "NumPy", category: "AI & ML" },
    { name: "AWS (S3, Bedrock)", category: "Cloud & Databases" },
    { name: "Azure Fundamentals", category: "Cloud & Databases" },
    { name: "Cloud Computing", category: "Cloud & Databases" },
    { name: "PostgreSQL", category: "Cloud & Databases" },
    { name: "MongoDB", category: "Cloud & Databases" },
    { name: "SQL", category: "Cloud & Databases" },
    { name: "SQLite", category: "Cloud & Databases" },
    { name: "Firebase", category: "Cloud & Databases" },
    { name: "Git", category: "Workflow & Tools" },
    { name: "Linux", category: "Workflow & Tools" },
    { name: "Agile", category: "Workflow & Tools" },
    { name: "Kanban", category: "Workflow & Tools" },
    { name: "VS Code", category: "Workflow & Tools" },
    { name: "Postman", category: "Workflow & Tools" },
    { name: "Android Studio", category: "Workflow & Tools" },
    { name: "Vim", category: "Workflow & Tools" }
  ],
  projects: [
    {
      id: "face-recognition-attendance",
      title: "Face-Recognition based Attendance System",
      summary:
        "Developed an automated attendance system using a pre-trained CNN for face detection, integrated with Python Flask for the web interface and SQLite for data management and report generation.",
      stack: ["Python", "Flask", "Machine Learning", "CNN", "SQLite"],
      featured: true,
      github: "",
      demo: "",
      content: [
        "Built between June and August 2023 to automate attendance capture with face recognition and a lightweight web interface.",
        "I integrated a pre-trained CNN model for face detection with a Python Flask application and SQLite-backed storage for attendance history and report generation.",
        "I evaluated model performance across varying lighting and environmental conditions and identified accuracy degradation, which shaped my understanding of deployment challenges in ML systems."
      ]
    },
    {
      id: "intelligent-transportation-system",
      title: "Intelligent System for Public and Private Transportation",
      summary:
        "Developed an Android multi-user location tracking app on Firebase Realtime Database that lets users share their location 1:1 or 1:n with 100+ community members, plus public transport and emergency safety features.",
      stack: ["Android Java", "Firebase Realtime Database", "Geo-location"],
      featured: true,
      github: "",
      demo: "",
      content: [
        "Built between December 2023 and February 2024 as a multi-user location tracking application.",
        "I used Firebase Realtime Database to let users share their location either one-to-one or one-to-many with over 100 community members.",
        "The app integrated public transportation features, including real-time bus tracking, and emergency services such as ambulance requests and women's safety alerts based on geo-location."
      ]
    }
  ],
  research: [
    {
      id: "two-warehouse-inventory-model",
      title:
        "A Two-Warehouse Inventory Model with an Advanced Payment Mechanism for Stock-Dependent Demand, Deteriorating Items with a Fixed Shelf Life and Partial Backlogging",
      summary:
        "Developed a mathematical model for managing the inventory of perishable goods with real-world complexities: fixed shelf life, stock-dependent demand, advance payments, and partial backlogging.",
      stack: ["Operations Research", "Mathematical Modeling", "Inventory Systems"],
      content: [
        "Published as a book chapter with Taylor & Francis in June 2024.",
        "This research modeled perishable inventory across two warehouses with realistic constraints around shelf life and demand behavior.",
        "It introduced an advanced payment mechanism and stock-dependent demand terms to better reflect practical decision environments.",
        "The framework can help optimize replenishment policy while balancing holding costs, shortages, and service expectations."
      ]
    }
  ],
  experience: [
    {
      company: "Storable India",
      companyUrl: "https://www.storable.com/",
      role: "Software Engineer I",
      location: "Hyderabad, Telangana, India",
      period: "Apr 2025 – Jul 2026",
      highlights: [
        "Designed and applied efficient PostgreSQL migrations to add new columns to a production schema across 4 tables, letting the team ship on schedule with zero downtime or data loss while reducing deployment risk.",
        "Developed an AI-powered chatbot system that generates structured JSON for dynamic section rendering, reducing section creation time from over 2 hours to under a minute, with guardrails for response validation and workflow reliability.",
        "Built a Micro-Frontend architecture to integrate two web applications into the CMS with a configurable setup, enabling scalable deployment of an improved UI across 600+ facilities.",
        "Received the quarterly Storrior Spotlight Award four times and the Emerging Storrior Award for exceptional performance, rapid growth, and consistent delivery of high-priority tasks."
      ]
    },
    {
      company: "Storable India",
      companyUrl: "https://www.storable.com/",
      role: "Associate Software Engineer",
      location: "Hyderabad, Telangana, India",
      period: "Aug 2024 – Mar 2025",
      highlights: [
        "Led the development of a compliance-related feature consuming APIs from two products, enabling an on-demand sync every 3 hours and securely storing specific data in the database for seamless website access.",
        "Managed Redux data storage for site-wide display, preventing potential legal liabilities of $10,000 per website for 20% of sites, and implemented secure frontend settings allowing admins to enable or disable the feature.",
        "Introduced a feature to 70 beta customers by developing a component that hosts a web app after form submission, with a dedicated route and a GraphQL mutation to enable or disable it."
      ]
    },
    {
      company: "Storable India",
      companyUrl: "https://www.storable.com/",
      role: "Software Development Engineer Intern",
      location: "Hyderabad, Telangana, India",
      period: "Feb 2024 – Aug 2024",
      highlights: [
        "Enhanced the CMS UI on the MERN stack, supporting nearly 5,000 websites, by upgrading react-bootstrap (0.32.3 to 2.9.2) and bootstrap (3.0.0 to 5.0.0), while resolving nearly 50 bugs in 2 weeks and implementing new features with their backend settings.",
        "Won 1st place in a Storable hackathon by developing a Flutter application that gives tenants a seamless experience using internal product data via APIs."
      ]
    }
  ],
  education: [
    {
      institution: "New York University, New York, NY",
      url: "https://www.nyu.edu/",
      degree: "M.S., Computer Science",
      period: "Sep 2026 – Expected May 2028"
    },
    {
      institution: "Gandhi Institute of Technology and Management (GITAM), Hyderabad, Telangana, India",
      url: "https://www.gitam.edu/",
      degree: "B.Tech, Computer Science Engineering",
      gpa: "CGPA: 3.79",
      period: "Aug 2020 – Apr 2024"
    }
  ],
  // Each entry: { subject, institution, period, description }
  teaching: [],
  // Each entry: { role, organization, url, location, period, current, type, description }
  activities: [],
  achievements: [
    {
      title: "Storrior Spotlight Award (4×) and Emerging Storrior Award",
      organization: "Storable",
      description: "Recognized for exceptional performance, rapid growth, and consistent delivery of high-priority tasks.",
      featured: true
    },
    {
      title: "1st Place, Storable Hackathon",
      organization: "Storable",
      date: "2024",
      description: "Built a Flutter application that gives tenants a seamless experience using internal product data via APIs.",
      featured: true
    },
    {
      title: "Top 0.74%, Innovate India Coding Championship (IICC)",
      organization: "Chandigarh University, Coding Ninjas, and AICTE",
      description:
        "Ranked among the top 3% of candidates in Round I and the top 0.74% in Round II, out of 1 lakh participants."
    },
    {
      title: "96.3469 Percentile, JEE Main (B.Tech)",
      description: "Joint Entrance Examination for engineering admissions in India."
    }
  ],
  certifications: [
    { title: "LEAD1x: Exercising Leadership: Foundational Principles", issuer: "Harvard University" },
    { title: "Aspire Leaders Program Finalist", issuer: "Aspire Institute" },
    { title: "Azure Fundamentals", issuer: "Microsoft" }
  ]
};
