"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  Settings, 
  User, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  RefreshCw, 
  FileDown, 
  Share2, 
  MoreVertical, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  History, 
  UserCheck, 
  Smile, 
  Check, 
  X, 
  Key, 
  Eye, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Info, 
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Project, 
  Persona, 
  Question, 
  Section, 
  Comment, 
  getProjects, 
  saveProjects, 
  getProject, 
  deleteProject, 
  generateMockGuide, 
  mockRegenerateQuestion,
  HeuristicsAlert
} from "../utils/nexusService";
import { generateInterviewGuideWithGemini, regenerateQuestionWithGemini } from "../utils/gemini";

export default function Home() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<"library" | "intake" | "workspace">("library");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  // Intake Form States
  const [intakeStep, setIntakeStep] = useState<1 | 2>(1);
  const [projectName, setProjectName] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [rawRequirements, setRawRequirements] = useState("");
  const [personas, setPersonas] = useState<Persona[]>([
    {
      id: "p-d",
      name: "Decision Maker",
      role: "C-suite executive",
      description: "Looking for ROI metrics, strategic alignment, and market validation.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=decision"
    },
    {
      id: "p-i",
      name: "Implementation Lead",
      role: "Senior Operations Engineer",
      description: "Focused on technical integration, data flows, and architectural constraints.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineering"
    }
  ]);
  
  // Intake Step 2: Structural Config States
  const [structuralSections, setStructuralSections] = useState<string[]>([
    "Warm-up / Rapport Building",
    "Core Behavioral Inquiries",
    "Deep-Dive / Follow-ups",
    "Wrap-up"
  ]);
  
  // Dynamic Persona Adding
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaRole, setNewPersonaRole] = useState("");
  const [newPersonaDesc, setNewPersonaDesc] = useState("");

  // Workspace View States
  const [workspaceTab, setWorkspaceTab] = useState<"editor" | "methodology">("editor");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [compareVersions, setCompareVersions] = useState(false);
  const [biasOverlayQId, setBiasOverlayQId] = useState<string | null>(null);
  
  // Search & Filter (Library)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");

  // Settings Panel (Gemini Config)
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [useLiveAi, setUseLiveAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Load projects from local storage
  useEffect(() => {
    setProjects(getProjects());
    // Load API keys if set in localStorage
    const savedKey = localStorage.getItem("nexus_gemini_key");
    const savedMode = localStorage.getItem("nexus_use_live_ai");
    if (savedKey) setApiKey(savedKey);
    if (savedMode === "true") setUseLiveAi(true);
  }, []);

  // Update selected question helper
  useEffect(() => {
    if (activeProject && selectedQuestionId) {
      for (const section of activeProject.sections) {
        const q = section.questions.find(qu => qu.id === selectedQuestionId);
        if (q) {
          setSelectedQuestion(q);
          return;
        }
      }
    }
    setSelectedQuestion(null);
  }, [selectedQuestionId, activeProject]);

  // Save changes to active project
  const updateActiveProject = (updated: Project) => {
    setActiveProject(updated);
    const updatedList = projects.map(p => p.id === updated.id ? updated : p);
    setProjects(updatedList);
    saveProjects(updatedList);
  };

  // ----------------------------------------------------
  // SETTINGS HANDLERS
  // ----------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("nexus_gemini_key", apiKey);
    localStorage.setItem("nexus_use_live_ai", useLiveAi ? "true" : "false");
    setShowSettings(false);
  };

  // ----------------------------------------------------
  // INTAKE ACTIONS
  // ----------------------------------------------------
  const handleAddPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonaName || !newPersonaRole) return;
    const newP: Persona = {
      id: `p-${Date.now()}`,
      name: newPersonaName,
      role: newPersonaRole,
      description: newPersonaDesc || "Target research persona.",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPersonaName}`
    };
    setPersonas([...personas, newP]);
    setNewPersonaName("");
    setNewPersonaRole("");
    setNewPersonaDesc("");
    setShowAddPersona(false);
  };

  const handleDeletePersona = (id: string) => {
    setPersonas(personas.filter(p => p.id !== id));
  };

  // Structure ordering
  const moveSection = (idx: number, direction: "up" | "down") => {
    const list = [...structuralSections];
    if (direction === "up" && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === "down" && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    setStructuralSections(list);
  };

  const handleAddSection = () => {
    const title = prompt("Enter section name:");
    if (title) {
      setStructuralSections([...structuralSections, title]);
    }
  };

  const handleDeleteSection = (idx: number) => {
    if (structuralSections.length <= 1) return;
    setStructuralSections(structuralSections.filter((_, i) => i !== idx));
  };

  const handleRenameSection = (idx: number) => {
    const current = structuralSections[idx];
    const renamed = prompt("Rename section:", current);
    if (renamed && renamed.trim()) {
      const list = [...structuralSections];
      list[idx] = renamed;
      setStructuralSections(list);
    }
  };

  // ----------------------------------------------------
  // GENERATION ENGINE TRIGGER
  // ----------------------------------------------------
  const triggerGuideGeneration = async () => {
    setLoading(true);
    setAiError("");
    try {
      let project: Project;
      if (useLiveAi && apiKey) {
        project = await generateInterviewGuideWithGemini(
          apiKey,
          projectName || "Untitled Interview Study",
          projectGoals || "Explore user experiences and workflows.",
          targetAudience || "General Target Users",
          rawRequirements || "",
          personas,
          structuralSections
        );
      } else {
        // High fidelity simulation mode
        await new Promise(r => setTimeout(r, 2000)); // Simulate LLM processing latency
        project = generateMockGuide(
          projectName || "Untitled Interview Study",
          projectGoals || "Explore user experiences and workflows.",
          targetAudience || "General Target Users",
          rawRequirements || "",
          personas,
          structuralSections
        );
      }

      // Add project to list
      const updatedList = [project, ...projects];
      setProjects(updatedList);
      saveProjects(updatedList);
      
      // Navigate to project
      setActiveProject(project);
      setCurrentView("workspace");
      setWorkspaceTab("editor");
      
      // Reset intake fields
      setProjectName("");
      setProjectGoals("");
      setTargetAudience("");
      setRawRequirements("");
      setIntakeStep(1);
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || "Failed to generate guide using Gemini AI. Verify your API key.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // WORKSPACE INTERACTIONS
  // ----------------------------------------------------
  const handleApplyNeutralSuggestion = (qId: string) => {
    if (!activeProject) return;
    const updatedSections = activeProject.sections.map(sec => {
      const questions = sec.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            current_text: q.neutral_text,
            bias_detected: null,
            versions: [
              ...q.versions,
              {
                version: q.versions.length + 1,
                text: q.neutral_text,
                timestamp: new Date().toISOString(),
                author: "System (Resolved Bias)"
              }
            ]
          };
        }
        return q;
      });
      return { ...sec, questions };
    });

    // Remove from alerts list
    const updatedAlerts = activeProject.expertReview.alerts.filter(alert => alert.question_id !== qId);
    
    // Recalculate score
    const newScore = Math.min(100, Math.round(100 - (updatedAlerts.length * 6)));
    const heuristic_score = newScore >= 95 ? "A" : newScore >= 88 ? "A-" : newScore >= 80 ? "B" : "C+";

    updateActiveProject({
      ...activeProject,
      sections: updatedSections,
      expertReview: {
        ...activeProject.expertReview,
        alerts: updatedAlerts,
        heuristic_score
      }
    });
    setBiasOverlayQId(null);
  };

  const handleDismissBiasAlert = () => {
    setBiasOverlayQId(null);
  };

  // Add Comment Thread
  const handleAddComment = () => {
    if (!activeProject || !selectedQuestionId || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: "Alex Rivera", // Simulate current user
      timestamp: "Just now",
      text: newCommentText,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
    };

    const updatedSections = activeProject.sections.map(sec => {
      const questions = sec.questions.map(q => {
        if (q.id === selectedQuestionId) {
          return {
            ...q,
            comments: [...q.comments, newComment]
          };
        }
        return q;
      });
      return { ...sec, questions };
    });

    updateActiveProject({
      ...activeProject,
      sections: updatedSections
    });
    setNewCommentText("");
  };

  // Micro-Regeneration (FR-01)
  const handleRegenerateQuestion = async (qId: string) => {
    if (!activeProject) return;
    
    // Locate the question
    let questionToRegen: Question | null = null;
    let secTitle = "";
    for (const sec of activeProject.sections) {
      const q = sec.questions.find(qu => qu.id === qId);
      if (q) {
        questionToRegen = q;
        secTitle = sec.title;
        break;
      }
    }

    if (!questionToRegen) return;

    setLoading(true);
    try {
      let updatedQ: Question;
      const feedback = newCommentText.trim() || "Neutralize bias and focus strictly on behavioral context.";

      if (useLiveAi && apiKey) {
        const surroundingContext = `Section: ${secTitle}. Project Goals: ${activeProject.goals}. Audience: ${activeProject.targetAudience}`;
        updatedQ = await regenerateQuestionWithGemini(apiKey, questionToRegen, feedback, surroundingContext);
      } else {
        // High fidelity simulation mode
        await new Promise(r => setTimeout(r, 1200));
        updatedQ = mockRegenerateQuestion(questionToRegen, feedback);
      }

      // Add feedback to comments list if provided
      if (newCommentText.trim()) {
        const userComment: Comment = {
          id: `c-${Date.now()}`,
          author: "Alex Rivera",
          timestamp: "Just now",
          text: `Triggered AI micro-regen: "${newCommentText}"`,
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
        };
        updatedQ.comments.push(userComment);
      }

      const updatedSections = activeProject.sections.map(sec => {
        const questions = sec.questions.map(q => q.id === qId ? updatedQ : q);
        return { ...sec, questions };
      });

      // Clear alerts relating to this question
      const updatedAlerts = activeProject.expertReview.alerts.filter(alert => alert.question_id !== qId);
      const newScore = Math.min(100, Math.round(100 - (updatedAlerts.length * 6)));
      const heuristic_score = newScore >= 95 ? "A" : newScore >= 88 ? "A-" : newScore >= 80 ? "B" : "C+";

      updateActiveProject({
        ...activeProject,
        sections: updatedSections,
        expertReview: {
          ...activeProject.expertReview,
          alerts: updatedAlerts,
          heuristic_score
        }
      });
      setNewCommentText("");
    } catch (e) {
      console.error(e);
      alert("Failed to regenerate the block. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activeProject) return;

    let md = `# Research Interview Guide: ${activeProject.name}\n\n`;
    md += `## Strategic Alignment\n`;
    md += `* **Goals & Objectives:** ${activeProject.goals}\n`;
    md += `* **Target Audience:** ${activeProject.targetAudience}\n`;
    md += `* **Score / Quality:** Objectivity Score ${activeProject.expertReview.heuristic_score}\n\n`;
    md += `---\n\n`;

    activeProject.sections.forEach(sec => {
      md += `## ${sec.title}\n\n`;
      sec.questions.forEach((q, idx) => {
        md += `### ${q.label} [${q.type}]\n`;
        md += `> **${q.current_text}**\n\n`;
        if (q.probing_prompts && q.probing_prompts.length > 0) {
          md += `*Follow-up / Probing questions:*\n`;
          q.probing_prompts.forEach(p => {
            md += `- *${p}*\n`;
          });
        }
        md += `\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, "-")}-guide.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reorder questions in left canvas
  const handleMoveQuestion = (sectionId: string, qIdx: number, direction: "up" | "down") => {
    if (!activeProject) return;
    const updatedSections = activeProject.sections.map(sec => {
      if (sec.id === sectionId) {
        const questions = [...sec.questions];
        if (direction === "up" && qIdx > 0) {
          const temp = questions[qIdx];
          questions[qIdx] = questions[qIdx - 1];
          questions[qIdx - 1] = temp;
        } else if (direction === "down" && qIdx < questions.length - 1) {
          const temp = questions[qIdx];
          questions[qIdx] = questions[qIdx + 1];
          questions[qIdx + 1] = temp;
        }
        return { ...sec, questions };
      }
      return sec;
    });

    updateActiveProject({ ...activeProject, sections: updatedSections });
  };

  const handleDeleteQuestion = (sectionId: string, qId: string) => {
    if (!activeProject) return;
    const updatedSections = activeProject.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          questions: sec.questions.filter(q => q.id !== qId)
        };
      }
      return sec;
    });

    // Remove matching alerts
    const updatedAlerts = activeProject.expertReview.alerts.filter(alert => alert.question_id !== qId);

    updateActiveProject({
      ...activeProject,
      sections: updatedSections,
      expertReview: {
        ...activeProject.expertReview,
        alerts: updatedAlerts
      }
    });

    if (selectedQuestionId === qId) {
      setSelectedQuestionId(null);
    }
  };

  const handleAddQuestionToSection = (sectionId: string) => {
    if (!activeProject) return;
    const qText = prompt("Enter new interview question:");
    if (!qText) return;

    const newQ: Question = {
      id: `q-added-${Date.now()}`,
      label: `Q${Math.floor(Math.random() * 90) + 10} • INQUIRY`,
      type: "Custom Inquiry",
      original_text: qText,
      neutral_text: qText,
      current_text: qText,
      probing_prompts: ["Can you explain that in more detail?"],
      bias_detected: null,
      comments: [],
      versions: [{ version: 1, text: qText, timestamp: new Date().toISOString(), author: "Alex Rivera" }]
    };

    const updatedSections = activeProject.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          questions: [...sec.questions, newQ]
        };
      }
      return sec;
    });

    updateActiveProject({ ...activeProject, sections: updatedSections });
  };

  // ----------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------

  // Highlighting biased strings
  const renderQuestionTextWithHighlight = (q: Question) => {
    if (!q.bias_detected || workspaceTab === "editor") {
      return <p className="text-slate-800 text-base leading-relaxed font-medium">{q.current_text}</p>;
    }

    const { highlighted_phrase } = q.bias_detected;
    // Simple substring replace
    const index = q.current_text.toLowerCase().indexOf(highlighted_phrase.toLowerCase());
    if (index === -1) {
      return <p className="text-slate-800 text-base leading-relaxed font-medium">{q.current_text}</p>;
    }

    const before = q.current_text.substring(0, index);
    const match = q.current_text.substring(index, index + highlighted_phrase.length);
    const after = q.current_text.substring(index + highlighted_phrase.length);

    return (
      <p className="text-slate-800 text-base leading-relaxed font-medium">
        {before}
        <span 
          onClick={(e) => {
            e.stopPropagation();
            setBiasOverlayQId(q.id);
          }}
          className="bg-amber-100 hover:bg-amber-200 border-b-2 border-amber-500 text-amber-900 cursor-pointer px-1 rounded-sm transition-colors duration-250 animate-pulse-slow"
        >
          {match}
        </span>
        {after}
      </p>
    );
  };

  // Filter project guides
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.goals.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedTypeFilter === "All" || p.type === selectedTypeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-neutral-800 flex font-sans antialiased overflow-hidden select-none">
      
      {/* ----------------------------------------------------
          SIDEBAR NAVIGATION
          ---------------------------------------------------- */}
      <aside className="w-64 border-r border-[#e5e5df] bg-[#f5f5f2] flex flex-col justify-between p-6 shrink-0 z-30">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center shadow-sm">
              <Compass className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-neutral-900 leading-tight font-display">NEXUS RESEARCH</h2>
              <p className="text-[9px] text-primary-700 font-bold uppercase tracking-widest leading-none mt-1">PRECISION ENGINE</p>
            </div>
          </div>

          {/* New Project CTA */}
          <button 
            onClick={() => {
              setCurrentView("intake");
              setIntakeStep(1);
              setActiveProject(null);
            }}
            className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>INITIALIZE NEW GUIDE</span>
          </button>

          {/* Nav Links */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: "library", label: "Guide Library", icon: FileText },
              { id: "intake", label: "Intake Console", icon: Compass, action: () => { setIntakeStep(1); setActiveProject(null); } },
              { id: "workspace", label: "Workspace Canvas", icon: Eye, disabled: !activeProject }
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              if (item.disabled) return null;

              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.action) item.action();
                    setCurrentView(item.id as any);
                  }}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? "bg-white text-primary-800 border border-[#e5e5df]/80 shadow-sm" 
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/40"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary-800" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-[#e5e5df]">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/25 transition-all cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5 text-neutral-400" />
            <span>Settings & API Key</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white border border-[#e5e5df]/65 rounded-2xl">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#e5e5df]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Alex Rivera Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-left overflow-hidden">
              <h4 className="text-[11px] font-black text-neutral-800 truncate leading-tight">Alex Rivera</h4>
              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Research Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MAIN SCREEN VIEWPORT
          ---------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fbfbf9] relative">
        <AnimatePresence mode="wait">
          
          {/* ====================================================
              VIEW A: LIBRARY
              ==================================================== */}
          {currentView === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 overflow-y-auto p-8 space-y-8"
            >
              {/* Header */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-neutral-900 font-display">Guide Library</h1>
                  <p className="text-neutral-500 text-sm mt-1.5 font-medium">Manage and organize your structured research methodologies.</p>
                </div>
                {/* Search / Filters controls */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search guides..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-white border border-[#e5e5df] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary-800 transition-colors w-60 text-neutral-800 placeholder-neutral-400"
                    />
                  </div>
                  <select 
                    value={selectedTypeFilter}
                    onChange={e => setSelectedTypeFilter(e.target.value)}
                    className="bg-white border border-[#e5e5df] rounded-xl px-3 py-2 text-xs text-neutral-600 focus:outline-none focus:border-primary-800"
                  >
                    <option>All Types</option>
                    <option value="Qualitative">Qualitative</option>
                    <option value="Mixed Methods">Mixed Methods</option>
                    <option value="Heuristic">Heuristic</option>
                    <option value="Cognitive">Cognitive</option>
                  </select>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Dotted "Initialize New Guide" Card */}
                <div 
                  onClick={() => {
                    setCurrentView("intake");
                    setIntakeStep(1);
                    setActiveProject(null);
                  }}
                  className="border-2 border-dashed border-[#d4d4cb] hover:border-primary-800 bg-[#f5f5f2]/40 hover:bg-[#f5f5f2]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[260px] group active:scale-99"
                >
                  <div className="w-12 h-12 bg-white border border-[#e5e5df] rounded-full flex items-center justify-center group-hover:bg-primary-50 group-hover:border-primary-300 transition-colors mb-4">
                    <Plus className="w-6 h-6 text-neutral-500 group-hover:text-primary-800" />
                  </div>
                  <h3 className="text-sm font-black tracking-wide text-neutral-800 font-display">Initialize New Guide</h3>
                  <p className="text-neutral-500 text-xs mt-2 leading-relaxed max-w-[200px] font-medium">Start a fresh research methodology from pre-defined framework templates.</p>
                </div>

                {/* Preset and Created Cards */}
                {filteredProjects.map(project => {
                  const hasBias = project.expertReview.alerts.length > 0;
                  return (
                    <div 
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project);
                        setCurrentView("workspace");
                        setWorkspaceTab("editor");
                        setSelectedQuestionId(null);
                      }}
                      className="bg-white hover:shadow-md border border-[#e5e5df] hover:border-[#d4d4cb] rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 overflow-hidden relative group"
                    >
                      {/* Top banner visual pattern based on project type */}
                      <div className={`h-16 relative bg-gradient-to-r ${
                        project.type === "Qualitative" ? "from-[#f0f5f3] to-[#e4ede9]" :
                        project.type === "Heuristic" ? "from-[#fbf4ea] to-[#f6e9d6]" :
                        "from-[#f3f0f7] to-[#e8e2ee]"
                      } border-b border-[#e5e5df] flex items-center px-5 justify-between`}>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          project.status === "FINALIZED" ? "bg-primary-50 text-primary-800 border border-primary-200/50" :
                          project.status === "IN REVIEW" ? "bg-amber-50 text-amber-800 border border-amber-200/50" :
                          "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}>
                          {project.status}
                        </span>
                        <div className="flex gap-1.5">
                          {project.collaborators.map((c, i) => (
                            <img key={i} src={c.avatar} alt={c.name} className="w-5.5 h-5.5 rounded-full border-2 border-white shadow-sm" title={c.name} />
                          ))}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-black tracking-tight text-neutral-900 group-hover:text-primary-800 transition-colors truncate font-display">{project.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-neutral-450 font-bold uppercase tracking-wider">
                            <span>{project.type}</span>
                            <span>•</span>
                            <span>{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <p className="text-neutral-500 text-xs mt-2 line-clamp-3 leading-relaxed font-medium">{project.goals}</p>
                        </div>

                        {/* Card bottom actions */}
                        <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#e5e5df]/60 text-neutral-500">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className={`w-4 h-4 ${hasBias ? "text-amber-600" : "text-primary-800"}`} />
                            <span className="text-[10px] font-bold tracking-wide uppercase text-neutral-650">
                              Score: {project.expertReview.heuristic_score}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveProject(project);
                                handleDownloadMarkdown();
                              }}
                              className="p-1.5 bg-[#fbfbf9] hover:bg-neutral-100 border border-[#e5e5df] rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
                              title="Download Markdown"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if(confirm("Are you sure you want to delete this project?")) {
                                  const updated = deleteProject(project.id);
                                  setProjects(updated);
                                }
                              }}
                              className="p-1.5 bg-[#fbfbf9] hover:bg-red-50 border border-[#e5e5df] rounded-lg text-neutral-500 hover:text-red-600 hover:border-red-200 transition-colors"
                              title="Delete Guide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}

              </div>
            </motion.div>
          )}

          {/* ====================================================
              VIEW B: INTAKE CONSOLE
              ==================================================== */}
          {currentView === "intake" && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex overflow-hidden h-full"
            >
              {/* Left intake panel form */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl border-r border-[#e5e5df]">
                {/* Step indicator */}
                <div className="flex justify-between items-center border-b border-[#e5e5df] pb-5">
                  <div>
                    <span className="text-[10px] bg-primary-50 text-primary-800 border border-primary-200/50 font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                      STEP {intakeStep} OF 2
                    </span>
                    <h1 className="text-2xl font-black text-neutral-900 mt-2 font-display">
                      {intakeStep === 1 ? "Strategic Alignment" : "Timeline Structure Configuration"}
                    </h1>
                  </div>
                  <div className="w-32 bg-[#f5f5f2] h-2 rounded-full overflow-hidden p-[1px] border border-[#e5e5df]">
                    <div 
                      className="bg-primary-800 h-full rounded-full transition-all duration-300"
                      style={{ width: intakeStep === 1 ? "50%" : "100%" }}
                    ></div>
                  </div>
                </div>

                {intakeStep === 1 ? (
                  /* STEP 1: FORM DETAILS */
                  <div className="space-y-6">
                    {/* Project Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Project Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., Urban Mobility Quantitative Assessment"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        className="w-full bg-white border border-[#e5e5df] rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary-800 transition-colors text-neutral-800 placeholder-neutral-400"
                      />
                    </div>

                    {/* Project Goals */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Project Overview & Goals</label>
                      <textarea 
                        rows={3}
                        placeholder="Define the primary learning objectives, key questions you want answered, or hypotheses of this initiative..."
                        value={projectGoals}
                        onChange={e => setProjectGoals(e.target.value)}
                        className="w-full bg-white border border-[#e5e5df] rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary-800 transition-colors text-neutral-800 placeholder-neutral-400 min-h-[90px]"
                      />
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Target Audience Description</label>
                      <textarea 
                        rows={2}
                        placeholder="Describe demographic traits, experience levels, or behaviors of the study participants..."
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value)}
                        className="w-full bg-white border border-[#e5e5df] rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary-800 transition-colors text-neutral-800 placeholder-neutral-400"
                      />
                    </div>

                    {/* Target Personas */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Target Personas</label>
                        <button 
                          onClick={() => setShowAddPersona(true)}
                          className="text-[10px] text-primary-800 hover:text-primary-950 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-white border border-[#e5e5df] px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          <Plus className="w-3 h-3" /> Add Persona
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personas.map(p => (
                          <div key={p.id} className="bg-white border border-[#e5e5df] rounded-xl p-4 flex gap-4 relative group shadow-sm">
                            <button 
                              onClick={() => handleDeletePersona(p.id)}
                              className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-11 h-11 bg-neutral-100 border border-[#e5e5df] rounded-xl overflow-hidden shrink-0 mt-0.5">
                              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-neutral-800">{p.name}</h4>
                              <p className="text-[10px] text-primary-800 font-bold uppercase tracking-wider leading-none">{p.role}</p>
                              <p className="text-[11px] text-neutral-500 leading-normal font-medium pt-1 line-clamp-2">{p.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw Requirements Input */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Raw Stakeholder Requirements</label>
                        <span className="text-[10px] text-neutral-400 font-medium">Paste meeting notes, bullet points or wikis</span>
                      </div>
                      <div className="relative">
                        <textarea 
                          rows={4}
                          placeholder="Paste unstructured comments here..."
                          value={rawRequirements}
                          onChange={e => setRawRequirements(e.target.value)}
                          className="w-full bg-white border border-[#e5e5df] rounded-xl p-3.5 text-sm focus:outline-none focus:border-primary-800 transition-colors text-neutral-800 placeholder-neutral-450 min-h-[100px] pr-12"
                        />
                        <div className="absolute right-3.5 bottom-3.5 p-2 bg-white border border-[#e5e5df] text-neutral-450 hover:text-primary-800 rounded-lg cursor-pointer transition-colors shadow-sm" title="Filter requirements logic">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Form actions */}
                    <div className="flex justify-between pt-6 border-t border-[#e5e5df]">
                      <button 
                        onClick={() => setCurrentView("library")}
                        className="bg-white hover:bg-neutral-50 border border-[#e5e5df] text-neutral-500 font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                      </button>
                      <button 
                        disabled={!projectName.trim()}
                        onClick={() => setIntakeStep(2)}
                        className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>Next: Structure Config</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: STRUCTURAL CONFIGURATION LIST */
                  <div className="space-y-6">
                    <p className="text-neutral-500 text-xs leading-relaxed max-w-xl font-medium">
                      Rather than presenting an empty canvas, define the core timeline phases of the interview. Drag, rename, delete or reorder items. The generation model strictly binds generated prompts under these structural objectives.
                    </p>

                    <div className="space-y-3 bg-[#f5f5f2]/40 border border-[#e5e5df] rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Timeline Sections ({structuralSections.length})</span>
                        <button 
                          onClick={handleAddSection}
                          className="text-[10px] text-primary-800 hover:text-primary-950 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-white border border-[#e5e5df] px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Block
                        </button>
                      </div>

                      {structuralSections.map((sec, idx) => (
                        <div 
                          key={idx}
                          className="bg-white border border-[#e5e5df] hover:border-[#d4d4cb] rounded-xl p-4 flex justify-between items-center transition-all duration-200 relative group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-[#f5f5f2] border border-[#e5e5df] rounded-lg flex items-center justify-center text-[10px] font-black text-primary-800">
                              0{idx + 1}
                            </span>
                            <span className="text-xs font-black text-neutral-800">{sec}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleRenameSection(idx)}
                              className="p-1.5 text-neutral-450 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                              title="Rename Block"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              className="p-1.5 text-neutral-450 hover:text-primary-800 disabled:opacity-30 disabled:hover:text-neutral-450 rounded-md hover:bg-neutral-100 transition-colors"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              disabled={idx === structuralSections.length - 1}
                              onClick={() => moveSection(idx, "down")}
                              className="p-1.5 text-neutral-450 hover:text-primary-800 disabled:opacity-30 disabled:hover:text-neutral-450 rounded-md hover:bg-neutral-100 transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              disabled={structuralSections.length <= 1}
                              onClick={() => handleDeleteSection(idx)}
                              className="p-1.5 text-neutral-450 hover:text-red-650 disabled:opacity-30 disabled:hover:text-neutral-450 rounded-md hover:bg-neutral-100 transition-colors"
                              title="Remove Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Step 2 actions */}
                    {aiError && (
                      <div className="bg-red-50 border border-red-200 text-red-755 p-4 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <span>{aiError}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-6 border-t border-[#e5e5df]">
                      <button 
                        onClick={() => setIntakeStep(1)}
                        className="bg-white hover:bg-neutral-50 border border-[#e5e5df] text-neutral-500 font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Strategic Alignment
                      </button>
                      <button 
                        disabled={loading}
                        onClick={triggerGuideGeneration}
                        className="bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>GENERATING INTERVIEW GUIDE...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>GENERATE STUDY GUIDE</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right intake panel: Nexus Intelligence sidebar */}
              <aside className="w-80 bg-[#f5f5f2] border-l border-[#e5e5df] p-6 flex flex-col justify-between shrink-0 space-y-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5df]">
                    <Sparkles className="w-4.5 h-4.5 text-primary-800" />
                    <h3 className="text-xs font-black tracking-widest text-neutral-800 uppercase leading-none">NEXUS INTELLIGENCE</h3>
                  </div>

                  {/* Alignment score */}
                  <div className="bg-white border border-[#e5e5df] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Intake Summary</span>
                      <span className="text-base font-black text-primary-800">82%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-[#f5f5f2] h-2 rounded-full overflow-hidden p-[1px] border border-[#e5e5df]">
                        <div className="bg-primary-800 h-full rounded-full" style={{ width: "82%" }}></div>
                      </div>
                      <span className="text-[9px] text-neutral-450 font-semibold leading-normal">Alignment Score. Evaluates goal completeness against industry targets.</span>
                    </div>
                  </div>

                  {/* Logical Filtering engine checks */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 leading-none">LOGICAL FILTERING ENGINE</span>
                      <span className="text-[9px] text-neutral-400 font-semibold">Nexus checks unstructured requirements on-the-fly.</span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-[#fbf6e9] border border-[#f5ebce] rounded-xl p-4 space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Confirmation Bias Detected</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">Notes mostly describe actions supporting project hypotheses, missing potential adversarial usage patterns.</p>
                      </div>

                      <div className="bg-[#edf6f1] border border-[#dbecd8] rounded-xl p-4 space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-emerald-850">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Structural Alignment Optimal</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">Target personas align effectively with B2B/quantitative stakeholder data structures.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5e5df] text-center">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Precision Methodology Framework v2.01</span>
                </div>
              </aside>
            </motion.div>
          )}

          {/* ====================================================
              VIEW C: WORKSPACE CANVAS (UNIFIED SPLIT VIEW)
              ==================================================== */}
          {currentView === "workspace" && activeProject && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col overflow-hidden h-full"
            >
              
              {/* TOP ACTION DOCK */}
              <div className="h-16 border-b border-[#e5e5df] bg-[#f5f5f2] px-6 flex justify-between items-center shrink-0 z-20">
                {/* Project breadcrumbs & stats info */}
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-white text-neutral-500 border border-[#e5e5df] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                        ACTIVE DRAFT
                      </span>
                      <h2 className="text-sm font-black text-neutral-900">{activeProject.name}</h2>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-450 font-bold uppercase tracking-wider leading-none mt-1">
                      <span>Edited 4m ago</span>
                      <span>•</span>
                      <span>3 active researchers</span>
                    </div>
                  </div>
                </div>

                {/* Main toggles & download buttons */}
                <div className="flex items-center gap-4">
                  {/* Editor vs Methodology View Switcher */}
                  <div className="bg-white border border-[#e5e5df] rounded-xl p-1 flex text-[10px] font-black shadow-sm">
                    <button 
                      onClick={() => setWorkspaceTab("editor")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        workspaceTab === "editor" ? "bg-[#f5f5f2] text-primary-800 border border-[#e5e5df]" : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      EDITOR
                    </button>
                    <button 
                      onClick={() => setWorkspaceTab("methodology")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        workspaceTab === "methodology" ? "bg-[#f5f5f2] text-primary-800 border border-[#e5e5df]" : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      METHODOLOGY VIEW
                      {activeProject.expertReview.alerts.length > 0 && (
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                      )}
                    </button>
                  </div>

                  <div className="h-6 w-[1px] bg-[#e5e5df]"></div>

                  <button 
                    onClick={handleDownloadMarkdown}
                    className="bg-white hover:bg-neutral-55 border border-[#e5e5df] text-neutral-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export .md</span>
                  </button>
                  <button className="bg-primary-800 hover:bg-primary-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* SPLIT SCREEN CANVAS CONTAINER */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* ----------------------------------------------------
                    LEFT CANVAS: THE STRUCTURAL OUTPUT ENGINE
                    ---------------------------------------------------- */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fbfbf9]">
                  <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Objectives banner at the top */}
                    <div className="bg-white border border-[#e5e5df] rounded-2xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 inset-x-0 h-[3px] bg-primary-800"></div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-800">Infrastructure Objectives Header</h3>
                      <p className="text-neutral-600 text-xs mt-2 leading-relaxed font-semibold">
                        **Core Hypotheses:** {activeProject.goals}
                      </p>
                      {activeProject.targetAudience && (
                        <p className="text-neutral-500 text-[11px] mt-1 font-semibold leading-relaxed">
                          **Target Sample:** {activeProject.targetAudience}
                        </p>
                      )}
                    </div>

                    {/* Verbatim Intro Section */}
                    <div className="bg-[#f5f5f2]/40 border border-dashed border-[#d4d4cb] rounded-2xl p-6 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Verbatim Study Introduction</span>
                      <p className="text-xs text-neutral-600 italic leading-relaxed font-medium">
                        "Welcome to our session today. Thank you for participating. We are testing a digital interface to gather raw behaviors. There are no right or wrong answers. You can stop at any time. Your data is anonymized and encrypted."
                      </p>
                    </div>

                    {/* Structural Phases */}
                    {activeProject.sections.map((section) => (
                      <div key={section.id} className="space-y-4">
                        {/* Section Header */}
                        <div className="flex justify-between items-center border-b border-[#e5e5df] pb-2">
                          <h3 className="text-xs font-black uppercase tracking-wider text-primary-800">{section.title}</h3>
                          <button 
                            onClick={() => handleAddQuestionToSection(section.id)}
                            className="p-1 hover:bg-neutral-100 border border-transparent hover:border-[#e5e5df] hover:text-primary-800 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                            title="Insert Question to Phase"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Question stack */}
                        <div className="space-y-4">
                          {section.questions.map((q, qIdx) => {
                            const isSelected = selectedQuestionId === q.id;
                            const hasBias = q.bias_detected !== null;
                            const isBiasAlertActive = biasOverlayQId === q.id;

                            return (
                              <div 
                                key={q.id}
                                onClick={() => setSelectedQuestionId(q.id)}
                                className={`bg-white border transition-all duration-200 rounded-2xl p-6 relative group shadow-sm ${
                                  isSelected 
                                    ? "border-primary-800 shadow-md" 
                                    : hasBias && workspaceTab === "methodology"
                                      ? "border-amber-300 bg-[#fbf6e9]/40 hover:border-amber-400" 
                                      : "border-[#e5e5df] hover:border-[#d4d4cb]"
                                }`}
                              >
                                {/* Drag actions / hover action dots menu */}
                                <div className="absolute right-4 top-4 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    disabled={qIdx === 0}
                                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(section.id, qIdx, "up"); }}
                                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20 hover:bg-neutral-100 rounded-md"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    disabled={qIdx === section.questions.length - 1}
                                    onClick={(e) => { e.stopPropagation(); handleMoveQuestion(section.id, qIdx, "down"); }}
                                    className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-20 hover:bg-neutral-100 rounded-md"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(section.id, q.id); }}
                                    className="p-1 text-neutral-450 hover:text-red-650 hover:bg-neutral-100 rounded-md"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Label line */}
                                <div className="flex gap-2 items-center mb-3">
                                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide leading-none">{q.label}</span>
                                  <span className="text-[8px] bg-[#f5f5f2] text-neutral-600 border border-[#e5e5df] font-black uppercase tracking-wider px-2 py-0.5 rounded leading-none">{q.type}</span>
                                  {hasBias && workspaceTab === "methodology" && (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); setBiasOverlayQId(q.id); }}
                                      className="text-[8px] bg-[#fbf6e9] text-amber-800 border border-amber-300 font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer shadow-sm"
                                    >
                                      <AlertTriangle className="w-2.5 h-2.5" /> Lead Check
                                    </span>
                                  )}
                                </div>

                                {/* Question Content */}
                                {renderQuestionTextWithHighlight(q)}

                                {/* Probing follow ups */}
                                {q.probing_prompts && q.probing_prompts.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-[#e5e5df]/60 pl-4 space-y-1.5 border-l border-[#e5e5df]">
                                    {q.probing_prompts.map((p, pIdx) => (
                                      <p key={pIdx} className="text-xs text-neutral-600 italic leading-relaxed font-medium">
                                        ↪ *"{p}"*
                                      </p>
                                    ))}
                                  </div>
                                )}

                                {/* AI BIAS ALERT DIALOG OVERLAY (Inline Bubble dialog matching Image 2) */}
                                <AnimatePresence>
                                  {isBiasAlertActive && q.bias_detected && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute left-1/2 -translate-x-1/2 bottom-2 bg-white border border-red-200 text-neutral-800 rounded-xl shadow-xl p-5 w-[360px] z-20 space-y-4"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center text-red-800">
                                          <AlertTriangle className="w-4 h-4 text-red-650" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">AI BIAS ALERT</span>
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDismissBiasAlert(); }}
                                          className="text-neutral-400 hover:text-neutral-700 p-0.5"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <p className="text-[11px] text-neutral-600 leading-normal font-medium">
                                        Detected <strong className="text-red-700">{q.bias_detected.issue_type}</strong> in {q.label}. This phrasing pre-determines responses.
                                      </p>

                                      <div className="bg-red-50 border border-red-150 rounded-lg p-3 text-[10px] font-mono text-red-805 leading-relaxed break-words">
                                        "{q.bias_detected.highlighted_phrase}"
                                      </div>

                                      <div className="flex gap-2">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleApplyNeutralSuggestion(q.id); }}
                                          className="flex-1 bg-primary-800 hover:bg-primary-900 text-white font-bold py-2.5 px-3 rounded-lg text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                                        >
                                          Apply Neutral Suggestion
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDismissBiasAlert(); }}
                                          className="bg-white hover:bg-neutral-50 border border-[#e5e5df] text-neutral-500 hover:text-neutral-800 font-bold py-2.5 px-3 rounded-lg text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                                        >
                                          Dismiss
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Verbatim Wrap-Up Section */}
                    <div className="bg-[#f5f5f2]/40 border border-dashed border-[#d4d4cb] rounded-2xl p-6 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Verbatim Wrap-Up & Closing</span>
                      <p className="text-xs text-neutral-600 italic leading-relaxed font-medium">
                        "That wraps up my main set of questions. Are there any other topics we did not cover that you would like to share, if anything? Thank you for your time. Your gift card details will be emailed shortly."
                      </p>
                    </div>

                  </div>
                </div>

                {/* ----------------------------------------------------
                    RIGHT CANVAS: THE MULTI-MODE CONTEXT PANEL
                    ---------------------------------------------------- */}
                <aside className="w-96 bg-[#f5f5f2] border-l border-[#e5e5df] flex flex-col justify-between shrink-0 overflow-y-auto">
                  
                  {selectedQuestionId === null ? (
                    
                    /* STATE A: GLOBAL EXPERT ANALYTICS */
                    <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
                      <div className="space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5df]">
                          <CheckCircle className="w-4.5 h-4.5 text-primary-800" />
                          <h3 className="text-xs font-black tracking-widest text-neutral-800 uppercase leading-none">Global Expert Analytics</h3>
                        </div>

                        {/* Methodology Health Card */}
                        <div className="bg-white border border-[#e5e5df] rounded-2xl p-5 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Objectivity Score</span>
                            <span className="text-lg font-black text-primary-800">
                              {activeProject.expertReview.heuristic_score}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e5e5df]">
                            <div>
                              <p className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider">Biased Phrases</p>
                              <p className="text-base font-black text-neutral-800 mt-1">
                                {activeProject.expertReview.alerts.length.toString().padStart(2, "0")}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider">Total Checks</p>
                              <p className="text-base font-black text-neutral-800 mt-1">
                                {activeProject.expertReview.total_questions.toString().padStart(2, "0")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Methodology Alerts List */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">METHODOLOGY ALERTS</span>
                          
                          {activeProject.expertReview.alerts.length === 0 ? (
                            <div className="bg-white border border-[#e5e5df] border-dashed rounded-xl p-6 text-center text-neutral-500 text-xs shadow-sm">
                              <Check className="w-5 h-5 text-emerald-700 mx-auto mb-2" />
                              <span>Methodology score clean. No biases detected in study prompts.</span>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {activeProject.expertReview.alerts.map((alert, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => alert.question_id && setSelectedQuestionId(alert.question_id)}
                                  className="bg-[#fbf6e9] hover:bg-[#fbf6e9]/80 border border-[#f5ebce] rounded-xl p-4 space-y-2 cursor-pointer transition-all shadow-sm"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      <span>{alert.issue_type}</span>
                                    </div>
                                    <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded uppercase font-black">
                                      {alert.severity}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-600 font-semibold line-clamp-2 leading-relaxed">
                                    "{alert.original_text}"
                                  </p>
                                  <span className="text-[9px] text-primary-800 hover:text-primary-950 font-bold block pt-1">
                                    View Suggestion & Correction →
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Protocol Balance */}
                        <div className="bg-[#edf6f1] border border-[#dbecd8] rounded-xl p-4 space-y-1.5 shadow-sm">
                          <div className="flex items-center gap-1.5 text-emerald-850">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Protocol Balance Check</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-semibold">
                            {activeProject.expertReview.protocol_balance}
                          </p>
                        </div>
                      </div>

                      {/* Collaborators online list */}
                      <div className="pt-4 border-t border-[#e5e5df] space-y-3">
                        <span className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider">Active In Document</span>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=jenkins" alt="Sarah Jenkins" className="w-5.5 h-5.5 rounded-full" />
                              <span className="font-bold text-neutral-700">Sarah Jenkins</span>
                            </div>
                            <span className="text-[9px] text-primary-800 font-bold uppercase">Editing Phase 02</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=marcus" alt="Marcus Chen" className="w-5.5 h-5.5 rounded-full" />
                              <span className="font-bold text-neutral-700">Marcus Chen</span>
                            </div>
                            <span className="text-[9px] text-neutral-450 font-bold uppercase">Viewing Only</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    
                    /* STATE B: THREADED ITEM COMMENTARY & FINE-TUNING */
                    <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden h-full">
                      {/* Top back list button & info */}
                      <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                        <button 
                          onClick={() => setSelectedQuestionId(null)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-800 font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-white border border-[#e5e5df] px-3.5 py-2 rounded-xl shadow-sm animate-all"
                        >
                          ← Back to Global analytics
                        </button>

                        {selectedQuestion && (
                          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                            {/* Question meta */}
                            <div className="space-y-1.5 pb-3 border-b border-[#e5e5df]">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{selectedQuestion.label}</span>
                              <p className="text-xs text-neutral-850 font-semibold italic leading-relaxed">
                                "{selectedQuestion.current_text}"
                              </p>
                            </div>

                            {/* Version history section */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Version Compare</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={compareVersions} 
                                    onChange={() => setCompareVersions(!compareVersions)} 
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-800 peer-checked:after:bg-white"></div>
                                </label>
                              </div>

                              {compareVersions && (
                                <div className="bg-white border border-[#e5e5df] rounded-xl p-4 text-[11px] leading-relaxed space-y-3 font-semibold shadow-sm">
                                  {selectedQuestion.versions.length <= 1 ? (
                                    <span className="text-neutral-450 italic block">No previous version history available yet.</span>
                                  ) : (
                                    <div className="space-y-3 divide-y divide-[#e5e5df]">
                                      {selectedQuestion.versions.map((ver, vIdx) => (
                                        <div key={vIdx} className="pt-2.5 first:pt-0">
                                          <div className="flex justify-between text-[9px] text-neutral-450 font-bold mb-1">
                                            <span>VERSION {ver.version}</span>
                                            <span>{ver.author}</span>
                                          </div>
                                          <p className={`font-medium ${
                                            vIdx === 0 
                                              ? "text-red-700 line-through" 
                                              : "text-emerald-850"
                                          }`}>
                                            "{ver.text}"
                                          </p>
                                          {ver.commentUsed && (
                                            <span className="text-[9px] text-neutral-450 italic block mt-1">
                                              Trigger: "{ver.commentUsed}"
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Threaded Comments history list */}
                            <div className="flex-1 overflow-y-auto space-y-4 pt-2 pr-1 select-text">
                              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block sticky top-0 bg-[#f5f5f2] pb-2">COLLABORATION THREAD</span>
                              
                              {selectedQuestion.comments.length === 0 ? (
                                <div className="text-center py-6 text-neutral-450 italic text-xs">
                                  No comments on this question block yet.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {selectedQuestion.comments.map(c => (
                                    <div key={c.id} className="flex gap-3 bg-white border border-[#e5e5df] rounded-xl p-3.5 shadow-sm">
                                      <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full border border-[#e5e5df] shrink-0" />
                                      <div className="space-y-1">
                                        <div className="flex justify-between items-baseline gap-4">
                                          <h4 className="text-[11px] font-black text-neutral-800">{c.author}</h4>
                                          <span className="text-[9px] text-neutral-400">{c.timestamp}</span>
                                        </div>
                                        <p className="text-[11px] text-neutral-600 leading-relaxed font-semibold">{c.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comment Input & Micro-regen button at the bottom */}
                      <div className="pt-4 border-t border-[#e5e5df] space-y-3 select-text">
                        <textarea 
                          rows={2}
                          placeholder="Add comment or feedback for AI micro-regen..."
                          value={newCommentText}
                          onChange={e => setNewCommentText(e.target.value)}
                          className="w-full bg-white border border-[#e5e5df] rounded-xl p-3 text-[11px] focus:outline-none focus:border-primary-800 text-neutral-850 placeholder-neutral-450 leading-normal shadow-sm"
                        />
                        <div className="flex gap-2">
                          <button 
                            disabled={!newCommentText.trim() || loading}
                            onClick={() => handleRegenerateQuestion(selectedQuestionId)}
                            className="flex-1 bg-primary-800 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-3 rounded-lg text-[10px] tracking-wide uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-sm"
                          >
                            {loading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            <span>Regenerate Selected Block</span>
                          </button>
                          <button 
                            disabled={!newCommentText.trim()}
                            onClick={handleAddComment}
                            className="bg-white hover:bg-neutral-50 border border-[#e5e5df] disabled:opacity-40 text-neutral-500 hover:text-neutral-800 font-bold py-2.5 px-3.5 rounded-lg text-[10px] tracking-wide uppercase transition-colors cursor-pointer shadow-sm"
                          >
                            Post
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </aside>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ----------------------------------------------------
          SETTINGS MODAL: GEMINI CONFIGURATION
          ---------------------------------------------------- */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e5e5df] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-6 text-neutral-800"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-800"></div>
              
              <div className="flex justify-between items-center pb-2 border-b border-[#e5e5df]">
                <div className="flex gap-2 items-center text-neutral-800">
                  <Key className="w-4 h-4 text-primary-800" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">Settings & API Credentials</span>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">AI GENERATION MODE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUseLiveAi(false)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        !useLiveAi 
                          ? "border-primary-800 bg-primary-50 text-primary-800" 
                          : "border-[#e5e5df] hover:border-neutral-350 text-neutral-500 hover:text-neutral-800 bg-white"
                      }`}
                    >
                      High-Fidelity Simulation
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseLiveAi(true)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        useLiveAi 
                          ? "border-primary-800 bg-primary-50 text-primary-800" 
                          : "border-[#e5e5df] hover:border-neutral-350 text-neutral-500 hover:text-neutral-800 bg-white"
                      }`}
                    >
                      Live Google Gemini AI
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-450 leading-normal font-semibold">
                    {!useLiveAi 
                      ? "Runs instantly using local high-fidelity mock generators. No API key required."
                      : "Sends prompt payloads directly to the Google Gemini API client-side."}
                  </p>
                </div>

                {/* API Key Input */}
                {useLiveAi && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">GOOGLE GEMINI API KEY</label>
                    <input 
                      type="password"
                      required
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="w-full bg-white border border-[#e5e5df] rounded-xl p-3 text-xs focus:outline-none focus:border-primary-800 text-neutral-800 font-mono shadow-sm"
                    />
                    <p className="text-[10px] text-neutral-450 leading-normal font-semibold">
                      Your key is saved locally in your browser's private state storage and never sent to any external server.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary-800/10 active:scale-98 transition-all text-xs tracking-wide uppercase cursor-pointer"
                >
                  Save & Apply Config
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          PERSONA DIALOG MODAL (Step 1 Dynamic Persona Creation)
          ---------------------------------------------------- */}
      <AnimatePresence>
        {showAddPersona && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e5e5df] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5 text-neutral-800"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-primary-800"></div>
              
              <div className="flex justify-between items-center pb-2 border-b border-[#e5e5df]">
                <div className="flex gap-2 items-center text-neutral-800">
                  <User className="w-4.5 h-4.5 text-primary-800" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">Add Target Research Persona</span>
                </div>
                <button 
                  onClick={() => setShowAddPersona(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddPersona} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">PERSONA NAME</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Leo Mercer"
                    value={newPersonaName}
                    onChange={e => setNewPersonaName(e.target.value)}
                    className="w-full bg-white border border-[#e5e5df] rounded-xl p-3 text-xs focus:outline-none focus:border-primary-800 text-neutral-850 placeholder-neutral-400 font-semibold shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">ROLE / CONTEXT</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Active DeFi Swapper"
                    value={newPersonaRole}
                    onChange={e => setNewPersonaRole(e.target.value)}
                    className="w-full bg-white border border-[#e5e5df] rounded-xl p-3 text-xs focus:outline-none focus:border-primary-800 text-neutral-850 placeholder-neutral-400 font-semibold shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-500 block">DESCRIPTION / ATTRIBUTES</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Performs 5 trades daily. Values slip tolerance & transparency. Easily confused by technical gas fee estimations."
                    value={newPersonaDesc}
                    onChange={e => setNewPersonaDesc(e.target.value)}
                    className="w-full bg-white border border-[#e5e5df] rounded-xl p-3 text-xs focus:outline-none focus:border-primary-800 text-neutral-850 placeholder-neutral-400 font-semibold shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary-800/10 active:scale-98 transition-all text-xs tracking-wide uppercase cursor-pointer"
                >
                  Create Persona Block
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
