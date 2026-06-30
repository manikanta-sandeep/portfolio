export const siteConfig = {
  siteName: "Manikanta Sandeep | Portfolio",
  siteUrl: "https://manikanta-sandeep.github.io",
  defaultDescription:
    "Portfolio of Manikanta Sandeep, showcasing software engineering projects, technical skills, experience, certifications, and engineering writing.",
  socialImage: "https://manikanta-sandeep.github.io/social-preview.svg",
  locale: "en_US"
};

export const profileData = {
  fullName: "Bala Sai Manikanta Sandeep Puppala",
  role: "Software Engineer",
  location: "Hyderabad, Telangana, India",
  summary:
    "Software Engineer with experience in AI-driven product features, CMS platforms, and scalable frontend architecture, currently building user-facing systems and internal tooling at Storable India.",
  email: "bp2876@nyu.edu",
  linkedin: "https://www.linkedin.com/in/replace-with-your-profile",
  github: "https://github.com/manikanta-sandeep",
  resumeFile: "/MSP_Resume_June.pdf",
  availability: "Open to software engineering opportunities and graduate research collaboration.",
  skills: [
    "Python",
    "JavaScript",
    "Java",
    "C",
    "Bash Scripting",
    "React",
    "Redux",
    "GraphQL",
    "MERN Stack",
    "Node.js",
    "REST APIs",
    "AI Agents",
    "Prompt Engineering",
    "AWS (S3, Bedrock)",
    "Azure Fundamentals",
    "MongoDB",
    "PostgreSQL",
    "Cloud Architecture",
    "Git",
    "Linux",
    "Agile"
  ],
  projects: [
    {
      id: "Face-Recognition",
      title: "Face-Recognition based Attendance System",
      summary:
        "Built an automated attendance system with a pre-trained CNN for face detection, Flask for web interface, and SQLite for data and report management.",
      stack: ["Python", "Flask", "CNN", "SQLite"],
      link: "#",
      content: [
        "This project focused on automating attendance capture using face recognition and a lightweight web interface.",
        "I integrated a pre-trained CNN model for face detection with a Flask application and SQLite-backed storage for attendance history and report generation.",
        "A key learning was model reliability under variable lighting and environmental conditions, which highlighted practical deployment trade-offs for ML systems."
      ]
    },
    {
      id: "2",
      title: "Intelligent System for Public and Private Transportation",
      summary:
        "Created an Android multi-user location sharing app with Firebase Realtime Database, plus public transport and emergency safety features based on geo-location.",
      stack: ["Android Java", "Firebase Realtime Database", "Geo-location"],
      link: "#",
      content: [
        "This Android application enabled multi-user location sharing across one-to-one and one-to-many groups.",
        "I used Firebase Realtime Database for low-latency synchronization and implemented location-triggered safety features for emergency use cases.",
        "The app also integrated public transport utility workflows such as live bus tracking and service support actions."
      ]
    }
  ],
  research: [
    {
      id: "r1",
      title: "Two-Warehouse Inventory Model With Advanced Payment Mechanism",
      summary:
        "Formulated an inventory model for deteriorating items with fixed shelf life, stock-dependent demand, and partial backlogging.",
      stack: ["Operations Research", "Mathematical Modeling", "Inventory Systems"],
      content: [
        "This research modeled perishable inventory across two warehouses with realistic constraints around shelf life and demand behavior.",
        "It introduced an advanced payment mechanism and stock-dependent demand terms to better reflect practical decision environments.",
        "The framework can help optimize replenishment policy while balancing holding costs, shortages, and service expectations."
      ]
    }
  ],
  experience: [
    {
      company: "Storable India",
      role: "Software Engineer I",
      period: "04/2025 - Present",
      highlights: [
        "Developed an AI-powered chatbot system that generates structured JSON for dynamic section rendering, reducing section creation time from over two hours to under one minute.",
        "Enhanced mobile Website Builder editor and internal CMS with drag-and-drop, resize, and reposition capabilities using react-dnd, enabling delivery one month ahead of schedule and onboarding of 50+ new clients.",
        "Implemented a Micro-Frontend integration strategy for two web applications into CMS, supporting scalable UI rollout across 600+ facilities.",
        "Received Storrior Spotlight Award four times and Emerging Storrior Award for high-impact delivery."
      ]
    },
    {
      company: "Storable India",
      role: "Associate Software Engineer",
      period: "08/2024 - 03/2025",
      highlights: [
        "Led development of a compliance feature consuming APIs from two products, enabling on-demand sync every three hours with secure storage and website access.",
        "Managed Redux-backed data display and secure feature controls to help avoid potential legal liabilities for website operators.",
        "Launched a feature to 70 beta customers with a dedicated route and GraphQL mutation to enable or disable web app hosting after form submission."
      ]
    },
    {
      company: "Storable India",
      role: "Software Development Engineer Intern",
      period: "02/2024 - 08/2024",
      highlights: [
        "Upgraded react-bootstrap (0.32.3 to 2.9.2) and bootstrap (3.0.0 to 5.0.0) across CMS UI supporting nearly 5000 websites.",
        "Resolved nearly 50 bugs within two weeks while adding new feature and backend settings support.",
        "Won first place in an internal Storable hackathon by building a Flutter tenant experience app consuming internal APIs."
      ]
    }
  ],
  education: [
    {
      institution: "New York University, New York, NY",
      degree: "MS, Computer Science (Incoming)",
      period: "09/2026 - Expected 05/2028"
    },
    {
      institution: "Gandhi Institute of Technology and Management (GITAM), Hyderabad, Telangana, India",
      degree: "B.Tech, Computer Science Engineering | CGPA: 3.79",
      period: "08/2020 - 04/2024"
    }
  ],
  certifications: [
    "LEAD1x: Exercising Leadership - Foundational Principles (Harvard University)",
    "Aspire Leaders Program Finalist (Aspire Institute)",
    "Azure Fundamentals"
  ]
};
