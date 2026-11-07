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
  kaggle: "https://www.kaggle.com/itsixorai",
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
      id: "penalty-kick-prediction",
      title: "Penalty Kick & Goalkeeper Direction Prediction from Video",
      summary:
        "A video pipeline that predicts where a penalty kick will go and which way the goalkeeper will dive, from run-up footage that stops 0.02 s before the ball is struck. I built it end to end for NYU CS-GY 6643 (Computer Vision), which we entered as a two-person team in a class Kaggle competition.",
      stack: ["Python", "PyTorch", "YOLO11x", "RTMPose", "DINOv2", "ConvNeXt", "R(2+1)D", "LightGBM", "OWLv2", "Optical Flow", "Slurm / HPC"],
      featured: true,
      github: "",
      demo: "",
      writeup: "/blog/predicting-penalty-kicks-from-run-up-video",
      media: "/projects/penalty-kick/pipeline.mp4",
      mediaPoster: "/projects/penalty-kick/pipeline-poster.jpg",
      mediaCaption: "The pipeline, step by step (illustration, not real match footage)",
      content: [
        "Each clip ends just before the kicker's foot meets the ball, so the model never sees the strike. It has to read the run-up and the players' posture to predict two things, both from the kicker's point of view: the kick direction (left, middle or right) and the goalkeeper's move (dive left, stay, dive right). The score is 0.7 × kick accuracy + 0.3 × keeper accuracy.",
        "The data is 2,200 broadcast clips from 215 source videos of men's and women's matches: shootouts, highlights and compilations, 1,300 for training and 900 for testing. Camera angles vary widely (some are mirrored), the frame is full of other people, and clips run from 0.3 to 9.8 seconds.",
        "I first find the right people. YOLO11x tracks players and the ball on a 25 Hz grid, OWLv2 finds the goal mouth, and the penalty ball is the object that stays still across frames. A pair-ranking picker chooses the kicker and keeper from their geometry relative to the ball and goal, with a DINOv2 appearance check to rescue wrong picks. Pitch calibration gives the camera view, and every clip is mirrored into one canonical frame that also accounts for the kicker's preferred foot.",
        "From there, RTMPose extracts 26-keypoint skeletons for kicker and keeper, alongside optical-flow and geometry features. A LightGBM model on these features was my first baseline (0.710 public). Fine-tuned DINOv2 (ViT-B and ViT-L), ConvNeXt and R(2+1)D video models added what hand-built features missed. Fourteen models are combined by a logistic-regression stack trained on out-of-fold predictions.",
        "Validation was grouped by source video from day one (5 folds × 3 seeds), because clips from the same shootout leak between folds. The best public score was 0.826 against the 0.514 sample baseline, with 92% keeper accuracy in cross-validation. For the final ranking I chose the submission with the strongest cross-validation (0.801 CV, 0.819 public) using decision rules set in advance. The private leaderboard, which decides the final rank, hasn't been released yet.",
        "Training ran on NYU's HPC course cluster (NVIDIA A100 40 GB GPUs under Slurm); retraining the final ensemble from scratch takes about 140 A100-hours. The code stays private until the course allows sharing it."
      ]
    },
    {
      id: "cross-modal-neuron-matching",
      title: "Cross-Modal Neuron Segmentation & Matching",
      summary:
        "Segments every neuron in paired in-vivo two-photon and ex-vivo fluorescence images of mouse brain, then matches each cell across the two images with no alignment given. I built it end to end for NYU CS-GY 6643 (Computer Vision), which we entered as a two-person team in a class Kaggle competition.",
      stack: ["Python", "PyTorch", "Cellpose-SAM", "DINOv2", "DINOCell", "OpenCV", "LightGBM", "ICP", "Hungarian Algorithm", "Slurm / HPC"],
      featured: true,
      github: "",
      demo: "",
      writeup: "/blog/finding-the-same-neuron-twice",
      media: "/projects/neuron-matching/pipeline.mp4",
      mediaPoster: "/projects/neuron-matching/pipeline-poster.jpg",
      mediaCaption: "The pipeline on one test region, redrawn as stylized cells from my predicted masks (no microscopy images)",
      content: [
        "The same brain region is imaged twice: once alive, with a two-photon microscope (hazy, about 600 × 600 px), and once after the tissue is fixed and sectioned, with fluorescence microscopy (sharper, up to 1627 × 1627 px, and full of bright processes that look like cells). The section is rotated, slightly scaled and not in the same optical plane, and no alignment is given. The task is to segment every neuron in both images and say which cells are the same.",
        "The score is 0.25 × panoptic quality on each modality plus 0.5 × the F1 of the matches, and a mask only counts at IoU above 0.75. A pair counts only if both of its masks pass, so matching depends on segmentation: on a ~10 px cell, one pixel of outline error can lose the pair. Held out, 79% of the missed pairs failed on a mask, not on the matching.",
        "Segmentation: fine-tuned Cellpose-SAM with top-hat filtered input at 3× scale won on in-vivo (held-out PQ 0.745, up from 0.605), with DINOCell's confident extra cells added on top. For ex-vivo, DINOCell (a DINOv2 ViT-B/8 backbone pretrained on 130k cell images, with a Cellpose flow head) carried over to the unseen mice best.",
        "Matching: I registered first, then matched. Hough voting over rotation and scale finds candidate affine transforms between the two cell constellations, ICP refines them and a learned ranker picks one, with a second pass that borrows confident transforms within each mouse. Every cell pair within 9 px after the transform is scored by a gradient-boosted verifier on 28 features, Hungarian assignment keeps one-to-one pairs, and regions with a registration probability below 0.2 get none. The course's suggested learned matcher, MARCO, registered 0 of 28 training regions.",
        "The final pipeline scored 0.531 on the public leaderboard and 0.548 under leave-one-mouse-out validation, which mirrors the test set of two unseen mice. Training ran on NYU's HPC cluster (NVIDIA A100 GPUs under Slurm)."
      ]
    },
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
