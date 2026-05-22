export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  avatar: string;
}

export interface BiasDetected {
  severity: "CRITICAL" | "WARNING" | null;
  issue_type: string;
  highlighted_phrase: string;
  rationale: string;
}

export interface QuestionVersion {
  version: number;
  text: string;
  timestamp: string;
  author: string;
  commentUsed?: string;
}

export interface Question {
  id: string;
  label: string;
  type: string;
  original_text: string;
  neutral_text: string;
  current_text: string;
  probing_prompts: string[];
  bias_detected: BiasDetected | null;
  comments: Comment[];
  versions: QuestionVersion[];
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface HeuristicsAlert {
  severity: "CRITICAL" | "WARNING";
  target_section: string;
  question_id: string;
  issue_type: string;
  original_text: string;
  suggested_fix: string;
  rationale: string;
}

export interface GlobalExpertCheck {
  heuristic_score: string;
  alerts: HeuristicsAlert[];
  total_questions: number;
  pacing_evaluation: string;
  protocol_balance: string;
}

export interface Project {
  id: string;
  name: string;
  goals: string;
  targetAudience: string;
  rawRequirements?: string;
  personas: Persona[];
  sections: Section[];
  expertReview: GlobalExpertCheck;
  status: "FINALIZED" | "IN REVIEW" | "GENERATING" | "DRAFT";
  type: "Qualitative" | "Mixed Methods" | "Heuristic" | "Cognitive" | "Survey";
  updatedAt: string;
  createdAt: string;
  collaborators: { name: string; avatar: string; role: string }[];
}

// ----------------------------------------------------
// HIGH FIDELITY PRESETS (Matches Screenshots)
// ----------------------------------------------------

export const PRESET_PROJECTS: Project[] = [
  {
    id: "mobile-banking",
    name: "Mobile Banking UX Research",
    goals: "Understand user behaviors and friction points during high-value mobile fund transfers and security approvals.",
    targetAudience: "Active mobile banking users aged 25-55 who transfer >$1,000 monthly.",
    status: "FINALIZED",
    type: "Qualitative",
    createdAt: "2023-10-01T08:00:00Z",
    updatedAt: "2023-10-12T15:30:00Z",
    collaborators: [
      { name: "Alex Rivera", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", role: "Researcher" },
      { name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", role: "Designer" }
    ],
    personas: [
      {
        id: "p1",
        name: "Busy Professional",
        role: "Financial Administrator",
        description: "Executes dozens of mobile transfers a week between meetings. Values pure speed and biometrics.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=busy"
      }
    ],
    sections: [
      {
        id: "s1",
        title: "Phase 01: Warm-up & Context",
        questions: [
          {
            id: "mb-q1",
            label: "Q1 • WARM-UP",
            type: "Rapport Building",
            original_text: "Could you tell me a little bit about your daily routine with managing your money on your phone?",
            neutral_text: "Could you tell me a little bit about your daily routine with managing your money on your phone?",
            current_text: "Could you tell me a little bit about your daily routine with managing your money on your phone?",
            probing_prompts: ["How often do you check banking apps?", "What tasks do you usually do?"],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "Could you tell me a little bit about your daily routine with managing your money on your phone?", timestamp: "2023-10-12T10:00:00Z", author: "System" }]
          },
          {
            id: "mb-q2",
            label: "Q2 • CONTEXT",
            type: "Open-ended Inquiry",
            original_text: "Describe the process of the last time you completed a high-value bank transfer (> $1,000).",
            neutral_text: "Describe the process of the last time you completed a high-value bank transfer (> $1,000).",
            current_text: "Describe the process of the last time you completed a high-value bank transfer (> $1,000).",
            probing_prompts: ["What device were you using?", "Where were you located at that moment?", "How did you verify it was successful?"],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "Describe the process of the last time you completed a high-value bank transfer (> $1,000).", timestamp: "2023-10-12T10:05:00Z", author: "System" }]
          }
        ]
      },
      {
        id: "s2",
        title: "Phase 02: Verification & Security Experience",
        questions: [
          {
            id: "mb-q3",
            label: "Q3 • EXPLORATION",
            type: "Behavioral Exploration",
            original_text: "Don't you find the biometric facial scan faster and safer than entering a code?",
            neutral_text: "How would you describe your experience with the biometric facial scan compared to manual security codes?",
            current_text: "How would you describe your experience with the biometric facial scan compared to manual security codes?",
            probing_prompts: ["What stands out to you during that verification step?", "What concerns, if any, do you have?"],
            bias_detected: null,
            comments: [
              { id: "c1", author: "Sarah Chen", text: "Approved the neutral correction. Much cleaner.", timestamp: "2023-10-12T11:30:00Z", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" }
            ],
            versions: [
              { version: 1, text: "Don't you find the biometric facial scan faster and safer than entering a code?", timestamp: "2023-10-12T10:10:00Z", author: "System" },
              { version: 2, text: "How would you describe your experience with the biometric facial scan compared to manual security codes?", timestamp: "2023-10-12T11:28:00Z", author: "System", commentUsed: "Apply neutral suggestion for Leading Question" }
            ]
          }
        ]
      }
    ],
    expertReview: {
      heuristic_score: "A",
      alerts: [],
      total_questions: 3,
      pacing_evaluation: "Highly targeted. Fits perfectly into a 30-minute session.",
      protocol_balance: "3:0 ratio of open-ended to closed questions. Excellent qualitative guide."
    }
  },
  {
    id: "ecommerce-checkout",
    name: "E-commerce Checkout Flow",
    goals: "Identify points of friction in guest checkout flows and checkout forms causing shopping cart abandonment.",
    targetAudience: "Users who added items to cart but left before completing transactions in past 30 days.",
    status: "IN REVIEW",
    type: "Mixed Methods",
    createdAt: "2023-11-01T09:00:00Z",
    updatedAt: "2023-11-04T12:00:00Z",
    collaborators: [
      { name: "Dr. Aris Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aris", role: "Principal Researcher" }
    ],
    personas: [
      {
        id: "p2",
        name: "Casual Shopper",
        role: "Occasional Buyer",
        description: "Shops on mobile from social links. Abandons cart if required to create password or input credit card manually.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shopper"
      }
    ],
    sections: [
      {
        id: "s1",
        title: "Phase 01: Warm-up",
        questions: [
          {
            id: "ec-q1",
            label: "Q1 • WARM-UP",
            type: "Rapport Building",
            original_text: "Walk me through how you typically shop online. What devices do you prefer?",
            neutral_text: "Walk me through how you typically shop online. What devices do you prefer?",
            current_text: "Walk me through how you typically shop online. What devices do you prefer?",
            probing_prompts: ["Why that device?", "Where are you usually sitting?"],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "Walk me through how you typically shop online. What devices do you prefer?", timestamp: "2023-11-04T09:00:00Z", author: "System" }]
          }
        ]
      },
      {
        id: "s2",
        title: "Phase 02: Checkout Exploration",
        questions: [
          {
            id: "ec-q2",
            label: "Q2 • EXPLORATION",
            type: "Behavioral Exploration",
            original_text: "What did you think of the new checkout interface and was the payment processing fast enough?",
            neutral_text: "How did you find the experience of navigating the checkout interface? What stood out about the speed of payment?",
            current_text: "What did you think of the new checkout interface and was the payment processing fast enough?",
            probing_prompts: ["Can you explain that?", "What do you mean by fast?"],
            bias_detected: {
              severity: "CRITICAL",
              issue_type: "Double-Barreled Question",
              highlighted_phrase: "checkout interface and was the payment processing fast",
              rationale: "This combines interface design evaluation with payment processing speed. If a user says 'it was slow', you won't know if they refer to the site loading or the payment gateway processing."
            },
            comments: [],
            versions: [{ version: 1, text: "What did you think of the new checkout interface and was the payment processing fast enough?", timestamp: "2023-11-04T09:05:00Z", author: "System" }]
          }
        ]
      }
    ],
    expertReview: {
      heuristic_score: "B-",
      alerts: [
        {
          severity: "CRITICAL",
          target_section: "Phase 02: Checkout Exploration",
          question_id: "ec-q2",
          issue_type: "Double-Barreled",
          original_text: "What did you think of the new checkout interface and was the payment processing fast enough?",
          suggested_fix: "Split into: 1. 'How did you find the experience of navigating the checkout interface?' and 2. 'What are your thoughts on the speed of the payment step?'",
          rationale: "Interface navigation and payment gateway latency represent two distinct friction vectors. Bundling them results in uninterpretable data."
        }
      ],
      total_questions: 2,
      pacing_evaluation: "Short, but containing critical methodological errors.",
      protocol_balance: "1:1 ratio. Recommend splitting the double-barreled items."
    }
  },
  {
    id: "urban-mobility",
    name: "Urban Mobility Quantitative Assessment",
    goals: "Evaluate the perceived effectiveness, speed, and safety of new transit lines compared to historical bus systems.",
    targetAudience: "Daily commuters in northern urban districts using the newly opened Metro Line 4.",
    status: "IN REVIEW",
    type: "Qualitative",
    createdAt: "2023-11-10T09:00:00Z",
    updatedAt: "2023-11-15T16:00:00Z",
    collaborators: [
      { name: "Sarah Jenkins", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jenkins", role: "Lead Researcher" },
      { name: "Marcus Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus", role: "Observer" }
    ],
    personas: [
      {
        id: "p3",
        name: "Decision Maker",
        role: "Urban Transit Director",
        description: "Wants concrete metrics demonstrating ROI on public transit investments and commuter sentiment alignment.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=director"
      },
      {
        id: "p4",
        name: "Implementation Lead",
        role: "Senior Operations Engineer",
        description: "Needs detailed feedback regarding transit schedules, capacity bottlenecks, and safety integrations.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer"
      }
    ],
    sections: [
      {
        id: "um-s1",
        title: "Phase 01: Introduction & Context",
        questions: [
          {
            id: "um-q1",
            label: "Q1 • WARM-UP",
            type: "Rapport Building",
            original_text: "Could you start by telling me a little bit about your current role and daily responsibilities?",
            neutral_text: "Could you start by telling me a little bit about your current role and daily responsibilities?",
            current_text: "Could you start by telling me a little bit about your current role and daily responsibilities?",
            probing_prompts: ["How long have you lived in this area?", "What is your primary mode of travel?"],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "Could you start by telling me a little bit about your current role and daily responsibilities?", timestamp: "2023-11-15T09:00:00Z", author: "System" }]
          },
          {
            id: "um-q2",
            label: "Q2 • CONTEXT",
            type: "Context Setting",
            original_text: "How would you describe your team's current research workflow to a new hire?",
            neutral_text: "How would you describe your team's current research workflow to a new hire?",
            current_text: "How would you describe your team's current research workflow to a new hire?",
            probing_prompts: ["What software tools do you rely on?", "Where do blocks occur?"],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "How would you describe your team's current research workflow to a new hire?", timestamp: "2023-11-15T09:02:00Z", author: "System" }]
          }
        ]
      },
      {
        id: "um-s2",
        title: "Phase 02: Exploration & Pain Points",
        questions: [
          {
            id: "um-q3",
            label: "Q3 • EXPLORATION",
            type: "Exploration",
            original_text: "Don't you think the current interface is a bit cluttered and hard to navigate?",
            neutral_text: "How would you describe your experience of navigating the current interface?",
            current_text: "Don't you think the current interface is a bit cluttered and hard to navigate?",
            probing_prompts: ["What stands out when looking at the screen?", "What elements, if any, seem complex?"],
            bias_detected: {
              severity: "CRITICAL",
              issue_type: "Leading Question",
              highlighted_phrase: "cluttered and hard to navigate",
              rationale: "Methodology Bias Detected: This is a leading question. It suggests a specific answer ('cluttered') rather than allowing the participant to define the experience."
            },
            comments: [],
            versions: [{ version: 1, text: "Don't you think the current interface is a bit cluttered and hard to navigate?", timestamp: "2023-11-15T09:05:00Z", author: "System" }]
          },
          {
            id: "um-q4",
            label: "Q4 • DRILL DOWN",
            type: "Likert Scale",
            original_text: "How much do you strongly prefer the current subway layout compared to the outdated and inefficient bus network currently serving the northern districts?",
            neutral_text: "How does the current subway layout compare to the bus network currently serving the northern districts?",
            current_text: "How much do you strongly prefer the current subway layout compared to the outdated and inefficient bus network currently serving the northern districts?",
            probing_prompts: ["What features stand out in each system?", "Tell me about safety differences, if any."],
            bias_detected: {
              severity: "CRITICAL",
              issue_type: "Leading Language",
              highlighted_phrase: "strongly prefer\" and \"outdated and inefficient",
              rationale: "AI BIAS ALERT: Detected leading language in Question 04. This phrase pushes the respondent towards a specific conclusion. 'strongly prefer' & 'outdated and inefficient' pre-determines the user's emotional state."
            },
            comments: [
              {
                id: "c-um-1",
                author: "Alex Rivera",
                text: "The wording in Q4 is highly suggestive. 'Outdated and inefficient' pre-determines the user's emotional state. We should neutralize this to 'existing' for better data integrity.",
                timestamp: "2023-11-15T10:42:00Z",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
              },
              {
                id: "c-um-2",
                author: "Sarah Chen",
                text: "Agreed. Updating the block now to follow the neutral methodology guidelines.",
                timestamp: "2023-11-15T11:15:00Z",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
              }
            ],
            versions: [{ version: 1, text: "How much do you strongly prefer the current subway layout compared to the outdated and inefficient bus network currently serving the northern districts?", timestamp: "2023-11-15T09:08:00Z", author: "System" }]
          },
          {
            id: "um-q5",
            label: "Q5 • DRILL DOWN",
            type: "Scale Evaluation",
            original_text: "Please rank your satisfaction with the frequency of train arrivals during peak commuting hours (7:00 AM – 9:00 AM).",
            neutral_text: "Please rank your satisfaction with the frequency of train arrivals during peak commuting hours (7:00 AM – 9:00 AM).",
            current_text: "Please rank your satisfaction with the frequency of train arrivals during peak commuting hours (7:00 AM – 9:00 AM).",
            probing_prompts: ["What has been your typical wait time?", "Describe a time when the schedule caused an issue."],
            bias_detected: null,
            comments: [],
            versions: [{ version: 1, text: "Please rank your satisfaction with the frequency of train arrivals during peak commuting hours (7:00 AM – 9:00 AM).", timestamp: "2023-11-15T09:12:00Z", author: "System" }]
          }
        ]
      }
    ],
    expertReview: {
      heuristic_score: "B-",
      alerts: [
        {
          severity: "CRITICAL",
          target_section: "Phase 02: Exploration & Pain Points",
          question_id: "um-q3",
          issue_type: "Leading Question",
          original_text: "Don't you think the current interface is a bit cluttered and hard to navigate?",
          suggested_fix: "How would you describe your experience of navigating the current interface?",
          rationale: "Suggesting adjectives like 'cluttered' and 'hard' limits the responder from expressing different feedback, leading to positive response bias."
        },
        {
          severity: "CRITICAL",
          target_section: "Phase 02: Exploration & Pain Points",
          question_id: "um-q4",
          issue_type: "Leading Language",
          original_text: "How much do you strongly prefer the current subway layout compared to the outdated and inefficient bus network currently serving the northern districts?",
          suggested_fix: "How does the current subway layout compare to the bus network currently serving the northern districts?",
          rationale: "Priming terms like 'strongly prefer', 'outdated' and 'inefficient' forces negative framing of the bus network, clouding objective commuter evaluation."
        }
      ],
      total_questions: 5,
      pacing_evaluation: "Good pace. Standard 30 to 45 minutes scope.",
      protocol_balance: "Your guide currently has a 3:1 ratio of open-ended to closed questions. Excellent for discovery."
    }
  }
];

// ----------------------------------------------------
// STATE MANAGEMENT & LOCAL STORAGE UTILITIES
// ----------------------------------------------------

const LOCAL_STORAGE_KEY = "nexus_research_guides";

export function getProjects(): Project[] {
  if (typeof window === "undefined") return PRESET_PROJECTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(PRESET_PROJECTS));
    return PRESET_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local projects:", e);
    return PRESET_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find(p => p.id === id);
}

export function deleteProject(id: string): Project[] {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  return projects;
}

// ----------------------------------------------------
// LOCAL SIMULATION AI GENERATOR (High-Fidelity)
// ----------------------------------------------------

export function generateMockGuide(
  name: string,
  goals: string,
  targetAudience: string,
  rawRequirements: string,
  personas: Persona[],
  sectionsList: string[]
): Project {
  // Parse keywords to adjust output topic
  const isWeb3 = goals.toLowerCase().includes("web3") || name.toLowerCase().includes("web3") || rawRequirements.toLowerCase().includes("web3") || goals.toLowerCase().includes("crypto");
  const isSaaS = goals.toLowerCase().includes("saas") || name.toLowerCase().includes("b2b") || rawRequirements.toLowerCase().includes("saas");
  const isMedical = goals.toLowerCase().includes("health") || goals.toLowerCase().includes("medical") || goals.toLowerCase().includes("patient");

  let topicName = "Digital Platform";
  if (isWeb3) topicName = "Web3 Wallet Swap";
  else if (isSaaS) topicName = "B2B Analytics Panel";
  else if (isMedical) topicName = "Patient Portal Dashboard";

  const generatedSections: Section[] = sectionsList.map((secName, secIdx) => {
    const questions: Question[] = [];
    const lowerSec = secName.toLowerCase();

    if (lowerSec.includes("warm-up") || lowerSec.includes("rapport") || secIdx === 0) {
      questions.push({
        id: `q-g-${secIdx}-1`,
        label: `Q1 • WARM-UP`,
        type: "Rapport Building",
        original_text: `Could you tell me a little bit about your current role and how you interact with ${topicName} products?`,
        neutral_text: `Could you tell me a little bit about your current role and how you interact with ${topicName} products?`,
        current_text: `Could you tell me a little bit about your current role and how you interact with ${topicName} products?`,
        probing_prompts: ["How often do you perform this task?", "What devices do you use?"],
        bias_detected: null,
        comments: [],
        versions: [{ version: 1, text: `Could you tell me a little bit about your current role and how you interact with ${topicName} products?`, timestamp: new Date().toISOString(), author: "System" }]
      });
      questions.push({
        id: `q-g-${secIdx}-2`,
        label: `Q2 • CONTEXT`,
        type: "Behavioral Context",
        original_text: `Describe the last time you had to set up or configure a workflow on ${topicName}.`,
        neutral_text: `Describe the last time you had to set up or configure a workflow on ${topicName}.`,
        current_text: `Describe the last time you had to set up or configure a workflow on ${topicName}.`,
        probing_prompts: ["What was the outcome?", "Where were you when you did this?"],
        bias_detected: null,
        comments: [],
        versions: [{ version: 1, text: `Describe the last time you had to set up or configure a workflow on ${topicName}.`, timestamp: new Date().toISOString(), author: "System" }]
      });
    } else if (lowerSec.includes("core") || lowerSec.includes("behavioral") || lowerSec.includes("exploration") || secIdx === 1) {
      // Create a leading question on purpose to demonstrate heuristics engine
      let originalQText = `Don't you agree that our new ${topicName} dashboard is much easier to use than the old clunky spreadsheet method?`;
      let neutralQText = `How would you compare executing tasks on the dashboard with using spreadsheet-based methods?`;
      let highlighted = "easier to use than the old clunky spreadsheet";
      let issueType = "Leading & Priming";
      let rationale = "Assumes the dashboard is inherently easier and labels the alternative as 'clunky', biasing responses towards the dashboard.";

      if (isWeb3) {
        originalQText = "How much easier did the brand new, security-audited swap interface make it to trade assets compared to the slow standard exchange?";
        neutralQText = "Walk me through how you completed your last asset trade using the swap interface compared to your previous exchange workflow.";
        highlighted = "easier did the brand new, security-audited swap interface";
        issueType = "Leading & Priming";
      } else if (isMedical) {
        originalQText = "Did you find scheduling appointments in the patient app quick and helpful, or was the service sluggish?";
        neutralQText = "Walk me through the process of scheduling your last appointment using the patient app.";
        highlighted = "quick and helpful, or was the service sluggish";
        issueType = "Double-Barreled Question";
        rationale = "Asks simultaneously about speed ('quick') and utility ('helpful'), while introducing biased framing ('sluggish').";
      }

      questions.push({
        id: `q-g-${secIdx}-1`,
        label: `Q3 • EXPLORATION`,
        type: "Core Exploration",
        original_text: originalQText,
        neutral_text: neutralQText,
        current_text: originalQText,
        probing_prompts: ["What stood out to you, if anything?", "How did that compare to your expectations?"],
        bias_detected: {
          severity: "CRITICAL",
          issue_type: issueType,
          highlighted_phrase: highlighted,
          rationale: rationale
        },
        comments: [],
        versions: [{ version: 1, text: originalQText, timestamp: new Date().toISOString(), author: "System" }]
      });

      // Second question in exploration - double barreled
      let originalQText2 = "What did you think of the new navigation tab and did the notifications load fast?";
      let neutralQText2 = "How did you find navigating the new tab layout? What stood out to you about notifications loading, if anything?";
      
      questions.push({
        id: `q-g-${secIdx}-2`,
        label: `Q4 • DRILL DOWN`,
        type: "Behavioral Exploration",
        original_text: originalQText2,
        neutral_text: neutralQText2,
        current_text: originalQText2,
        probing_prompts: ["Can you expand on what you mean by that?", "Why is that speed important for you?"],
        bias_detected: {
          severity: "WARNING",
          issue_type: "Double-Barreled Question",
          highlighted_phrase: "navigation tab and did the notifications load",
          rationale: "Asks about two distinct user interactions: layout navigation and data refresh latency. Splitting these is necessary."
        },
        comments: [],
        versions: [{ version: 1, text: originalQText2, timestamp: new Date().toISOString(), author: "System" }]
      });
    } else if (lowerSec.includes("deep") || lowerSec.includes("follow") || secIdx === 2) {
      // Speculative question
      let originalQText = "Would you pay a $15 monthly premium if we added an AI smart assistant to help automate these transfers next quarter?";
      let neutralQText = "Tell me about the last tool or subscription you purchased to automate your financial workflows. What went into that decision?";
      let highlighted = "Would you pay a $15 monthly premium if we added";

      questions.push({
        id: `q-g-${secIdx}-1`,
        label: `Q5 • SPECULATION`,
        type: "Hypothetical Future",
        original_text: originalQText,
        neutral_text: neutralQText,
        current_text: originalQText,
        probing_prompts: ["What problems would you expect an assistant to solve, if any?", "How do you solve that problem today?"],
        bias_detected: {
          severity: "CRITICAL",
          issue_type: "Speculative / Future Hypothesis",
          highlighted_phrase: highlighted,
          rationale: "Participants cannot accurately predict future economic choices. Investigating actual past purchases gives high-integrity behavioral data."
        },
        comments: [],
        versions: [{ version: 1, text: originalQText, timestamp: new Date().toISOString(), author: "System" }]
      });
    } else {
      questions.push({
        id: `q-g-${secIdx}-1`,
        label: `Q${secIdx * 2 + 1} • WRAP-UP`,
        type: "Session Closure",
        original_text: "What else did you want to share about your experience with our product today, if anything?",
        neutral_text: "What else did you want to share about your experience with our product today, if anything?",
        current_text: "What else did you want to share about your experience with our product today, if anything?",
        probing_prompts: ["Are there questions you thought we would ask, but didn't?", "Who else do you think we should interview?"],
        bias_detected: null,
        comments: [],
        versions: [{ version: 1, text: "What else did you want to share about your experience with our product today, if anything?", timestamp: new Date().toISOString(), author: "System" }]
      });
    }

    return {
      id: `sec-${secIdx}`,
      title: secName,
      questions
    };
  });

  // Calculate Heuristics Alerts
  const alerts: HeuristicsAlert[] = [];
  let score = 95;

  generatedSections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.bias_detected) {
        alerts.push({
          severity: q.bias_detected.severity || "WARNING",
          target_section: sec.title,
          question_id: q.id,
          issue_type: q.bias_detected.issue_type,
          original_text: q.original_text,
          suggested_fix: q.neutral_text,
          rationale: q.bias_detected.rationale
        });
        score -= q.bias_detected.severity === "CRITICAL" ? 7 : 4;
      }
    });
  });

  const heuristic_score = score >= 90 ? "A-" : score >= 80 ? "B" : score >= 70 ? "C+" : "D";
  const total_questions = generatedSections.reduce((acc, s) => acc + s.questions.length, 0);

  const expertReview: GlobalExpertCheck = {
    heuristic_score,
    alerts,
    total_questions,
    pacing_evaluation: `Balanced pacing with ${total_questions} items. Highly optimal for a 45-minute qualitative study.`,
    protocol_balance: "3:1 ratio of open-ended to closed questions. Good discovery foundation."
  };

  return {
    id: `project-${Date.now()}`,
    name,
    goals,
    targetAudience,
    rawRequirements,
    personas,
    sections: generatedSections,
    expertReview,
    status: "IN REVIEW",
    type: "Qualitative",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [
      { name: "Sarah Jenkins", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jenkins", role: "Lead Researcher" }
    ]
  };
}

export function mockRegenerateQuestion(question: Question, feedback: string): Question {
  const newText = `[Revised] ${question.neutral_text} (Adjusted based on: "${feedback}")`;
  
  const nextVer = question.versions.length + 1;
  const newVersions = [
    ...question.versions,
    {
      version: nextVer,
      text: newText,
      timestamp: new Date().toISOString(),
      author: "System AI",
      commentUsed: feedback
    }
  ];

  return {
    ...question,
    current_text: newText,
    bias_detected: null, // clear bias since it's regenerated
    versions: newVersions
  };
}
