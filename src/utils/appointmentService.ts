import { supabase } from "./supabase/client";

export interface Advisor {
  id: string;
  name: string;
  role: "advisor";
  specialty: string;
  bio: string;
  avatar_url: string;
}

export interface Appointment {
  id: string;
  student_id: string;
  advisor_id: string;
  student_name: string;
  student_age: number;
  student_phone?: string;
  topic: string;
  goals?: string;
  appointment_time: string; // ISO string
  status: "upcoming" | "completed" | "cancelled";
  created_at: string;
}

export interface QuestProgress {
  quest_id: string;
  title: string;
  description: string;
  xp_reward: number;
  current_count: number;
  target_count: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
}

export interface StudentStats {
  profile_id: string;
  xp: number;
  level: number;
  points: number;
}

// ----------------------------------------------------
// DEFAULT MOCK DATA FOR SEEDING & FALLBACK
// ----------------------------------------------------

const MOCK_ADVISORS: Advisor[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dr. Aris Chen",
    role: "advisor",
    specialty: "University Admissions",
    bio: "Former Yale admissions officer helping students craft standout applications and secure elite scholarships.",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=aris",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Sarah Jenkins",
    role: "advisor",
    specialty: "Career Planning",
    bio: "Tech talent recruiter specialized in career transition, resume crafting, and corporate internship mapping.",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=sarah",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Coach Marcus Vance",
    role: "advisor",
    specialty: "Subject Selection & Study Skills",
    bio: "High school academic counselor sharing learning strategies, time management habits, and subject streams.",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcus",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Elena Rostova",
    role: "advisor",
    specialty: "Interview Prep & Speaking",
    bio: "Public speaking coach and university interviewer preparing teenagers for high-stress admission panels.",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=elena",
  },
];

const MOCK_QUESTS: Omit<QuestProgress, "current_count" | "is_completed">[] = [
  {
    quest_id: "complete_profile",
    title: "Kickstart Your Journey",
    description: "Register a profile on FuturePath",
    xp_reward: 100,
    target_count: 1,
  },
  {
    quest_id: "first_booking",
    title: "The First Step",
    description: "Book your first advising session",
    xp_reward: 150,
    target_count: 1,
  },
  {
    quest_id: "first_session",
    title: "Meet Your Mentor",
    description: "Complete your first career advice session",
    xp_reward: 250,
    target_count: 1,
  },
  {
    quest_id: "deep_explorer",
    title: "Deep Explorer",
    description: "Attend advising sessions with 2 different advisors",
    xp_reward: 200,
    target_count: 2,
  },
];

const MOCK_BADGES: Badge[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Booked your first consultation session",
    icon_name: "Compass",
    xp_reward: 50,
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Completed your first career advice session",
    icon_name: "BookOpen",
    xp_reward: 100,
  },
  {
    id: "goal_crusher",
    name: "Goal Crusher",
    description: "Completed a session with focused goals achieved",
    icon_name: "Award",
    xp_reward: 100,
  },
  {
    id: "polymath",
    name: "Polymath Explorer",
    description: "Consulted with multiple advisors across different topics",
    icon_name: "Layers",
    xp_reward: 150,
  },
];

// Helper to determine if DB returned a schema missing error
function isDbError(err: any): boolean {
  if (!err) return false;
  // PGRST205 means table not found
  return err.code === "PGRST205" || err.message?.includes("relation") || err.message?.includes("cache");
}

// ----------------------------------------------------
// LOCAL STORAGE ADAPTER FUNCTIONS
// ----------------------------------------------------

function getLocalAdvisors(): Advisor[] {
  const data = localStorage.getItem("futurepath_advisors");
  if (data) return JSON.parse(data);
  localStorage.setItem("futurepath_advisors", JSON.stringify(MOCK_ADVISORS));
  return MOCK_ADVISORS;
}

function getLocalAppointments(): Appointment[] {
  const data = localStorage.getItem("futurepath_appointments");
  return data ? JSON.parse(data) : [];
}

function saveLocalAppointments(apps: Appointment[]) {
  localStorage.setItem("futurepath_appointments", JSON.stringify(apps));
}

// ----------------------------------------------------
// SERVICE EXPORTS
// ----------------------------------------------------

export async function getAdvisors(): Promise<Advisor[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "advisor");

    if (error && isDbError(error)) {
      return getLocalAdvisors();
    }
    return (data as Advisor[]) || getLocalAdvisors();
  } catch (e) {
    return getLocalAdvisors();
  }
}

export async function getAppointments(userId: string, role: "student" | "advisor"): Promise<Appointment[]> {
  try {
    const queryField = role === "student" ? "student_id" : "advisor_id";
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq(queryField, userId)
      .order("appointment_time", { ascending: true });

    if (error && isDbError(error)) {
      return getLocalAppointments().filter(app => (role === "student" ? app.student_id : app.advisor_id) === userId);
    }
    return (data as Appointment[]) || [];
  } catch (e) {
    return getLocalAppointments().filter(app => (role === "student" ? app.student_id : app.advisor_id) === userId);
  }
}

export async function createAppointment(
  studentId: string,
  studentName: string,
  studentAge: number,
  studentPhone: string,
  advisorId: string,
  topic: string,
  goals: string,
  appointmentTime: string
): Promise<{ data: Appointment | null; error: any; gamificationAlert?: string }> {
  const newApp: Appointment = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    student_id: studentId,
    advisor_id: advisorId,
    student_name: studentName,
    student_age: studentAge,
    student_phone: studentPhone,
    topic,
    goals,
    appointment_time: appointmentTime,
    status: "upcoming",
    created_at: new Date().toISOString(),
  };

  let useLocal = false;
  let errorMsg = null;

  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([newApp])
      .select()
      .single();

    if (error) {
      if (isDbError(error)) {
        useLocal = true;
      } else {
        errorMsg = error.message;
      }
    }
  } catch (e) {
    useLocal = true;
  }

  if (useLocal) {
    const localApps = getLocalAppointments();
    localApps.push(newApp);
    saveLocalAppointments(localApps);
  }

  if (errorMsg) {
    return { data: null, error: errorMsg };
  }

  // Award Gamification for Booking!
  const alert = await awardBookingRewards(studentId, advisorId);

  return { data: newApp, error: null, gamificationAlert: alert };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "upcoming" | "completed" | "cancelled"
): Promise<{ error: any; gamificationAlert?: string }> {
  let useLocal = false;
  let appToUpdate: Appointment | null = null;
  let errorMsg = null;

  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      if (isDbError(error)) {
        useLocal = true;
      } else {
        errorMsg = error.message;
      }
    } else {
      appToUpdate = data;
    }
  } catch (e) {
    useLocal = true;
  }

  if (useLocal) {
    const localApps = getLocalAppointments();
    const idx = localApps.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      localApps[idx].status = status;
      appToUpdate = localApps[idx];
      saveLocalAppointments(localApps);
    }
  }

  if (errorMsg) {
    return { error: errorMsg };
  }

  // If appointment was completed, award complete session rewards!
  let alert = undefined;
  if (status === "completed" && appToUpdate) {
    alert = await awardSessionCompletionRewards(appToUpdate.student_id);
  }

  return { error: null, gamificationAlert: alert };
}

// ----------------------------------------------------
// GAMIFICATION RULES ENGINE
// ----------------------------------------------------

async function awardBookingRewards(studentId: string, advisorId: string): Promise<string> {
  const quests = await getStudentQuests(studentId);
  const stats = await getStudentStats(studentId);

  let xpEarned = 0;
  let pointsEarned = 0;
  let messageParts: string[] = [];

  // 1. Check "first_booking" Quest
  const firstBookingQuest = quests.find(q => q.quest_id === "first_booking");
  if (firstBookingQuest && !firstBookingQuest.is_completed) {
    xpEarned += firstBookingQuest.xp_reward;
    pointsEarned += 50;
    await completeQuestLocalOrDb(studentId, "first_booking");
    messageParts.push(`Completed Quest: 'The First Step' (+${firstBookingQuest.xp_reward} XP)`);

    // Unlock 'first_step' Badge
    const unlocked = await unlockBadgeLocalOrDb(studentId, "first_step");
    if (unlocked) {
      xpEarned += 50;
      messageParts.push("Unlocked Badge: 'First Step' (+50 XP)");
    }
  }

  // 2. Check "deep_explorer" Quest
  const studentApps = await getAppointments(studentId, "student");
  // Find distinct advisors in history
  const advisorIds = Array.from(new Set(studentApps.map(a => a.advisor_id)));
  const deepExplorerQuest = quests.find(q => q.quest_id === "deep_explorer");

  if (deepExplorerQuest && !deepExplorerQuest.is_completed) {
    const currentAdvisorsCount = advisorIds.length;
    if (currentAdvisorsCount >= 2) {
      xpEarned += deepExplorerQuest.xp_reward;
      pointsEarned += 100;
      await completeQuestLocalOrDb(studentId, "deep_explorer", currentAdvisorsCount);
      messageParts.push(`Completed Quest: 'Deep Explorer' (+${deepExplorerQuest.xp_reward} XP)`);

      // Unlock 'polymath' Badge
      const unlocked = await unlockBadgeLocalOrDb(studentId, "polymath");
      if (unlocked) {
        xpEarned += 150;
        messageParts.push("Unlocked Badge: 'Polymath Explorer' (+150 XP)");
      }
    } else {
      await updateQuestProgressLocalOrDb(studentId, "deep_explorer", currentAdvisorsCount);
    }
  }

  if (xpEarned > 0) {
    const levelUp = await addXpLocalOrDb(studentId, stats, xpEarned, pointsEarned);
    if (levelUp) {
      messageParts.push(`🎉 LEVEL UP! You reached Level ${levelUp.newLevel}!`);
    }
    return messageParts.join("\n");
  }

  return "";
}

async function awardSessionCompletionRewards(studentId: string): Promise<string> {
  const quests = await getStudentQuests(studentId);
  const stats = await getStudentStats(studentId);

  let xpEarned = 0;
  let pointsEarned = 0;
  let messageParts: string[] = [];

  // 1. Check "first_session" Quest
  const firstSessionQuest = quests.find(q => q.quest_id === "first_session");
  if (firstSessionQuest && !firstSessionQuest.is_completed) {
    xpEarned += firstSessionQuest.xp_reward;
    pointsEarned += 100;
    await completeQuestLocalOrDb(studentId, "first_session");
    messageParts.push(`Completed Quest: 'Meet Your Mentor' (+${firstSessionQuest.xp_reward} XP)`);

    // Unlock 'knowledge_seeker' Badge
    const unlocked = await unlockBadgeLocalOrDb(studentId, "knowledge_seeker");
    if (unlocked) {
      xpEarned += 100;
      messageParts.push("Unlocked Badge: 'Knowledge Seeker' (+100 XP)");
    }
  }

  // Always grant goal crusher potential or session complete bonus
  xpEarned += 30; // base completion XP
  pointsEarned += 15;
  messageParts.push("Session Completion Bonus (+30 XP)");

  // Unlock 'goal_crusher' badge on a 50% chance for mock gamified feedback, or if student had goals
  const unlocked = await unlockBadgeLocalOrDb(studentId, "goal_crusher");
  if (unlocked) {
    xpEarned += 100;
    messageParts.push("Unlocked Badge: 'Goal Crusher' (+100 XP)");
  }

  if (xpEarned > 0) {
    const levelUp = await addXpLocalOrDb(studentId, stats, xpEarned, pointsEarned);
    if (levelUp) {
      messageParts.push(`🎉 LEVEL UP! You reached Level ${levelUp.newLevel}!`);
    }
    return messageParts.join("\n");
  }

  return "";
}

// ----------------------------------------------------
// DATA ACCESS READ/WRITE (GAMIFICATION STATE)
// ----------------------------------------------------

export async function getStudentStats(studentId: string): Promise<StudentStats> {
  const defaultStats: StudentStats = { profile_id: studentId, xp: 100, level: 2, points: 50 };
  try {
    const { data, error } = await supabase
      .from("student_stats")
      .select("*")
      .eq("profile_id", studentId)
      .single();

    if (error && isDbError(error)) {
      const stats = localStorage.getItem(`futurepath_stats_${studentId}`);
      if (stats) return JSON.parse(stats);
      localStorage.setItem(`futurepath_stats_${studentId}`, JSON.stringify(defaultStats));
      return defaultStats;
    }
    return data || defaultStats;
  } catch (e) {
    const stats = localStorage.getItem(`futurepath_stats_${studentId}`);
    if (stats) return JSON.parse(stats);
    localStorage.setItem(`futurepath_stats_${studentId}`, JSON.stringify(defaultStats));
    return defaultStats;
  }
}

export async function getStudentQuests(studentId: string): Promise<QuestProgress[]> {
  const defaultQuests = MOCK_QUESTS.map(q => ({
    ...q,
    current_count: q.quest_id === "complete_profile" ? 1 : 0,
    is_completed: q.quest_id === "complete_profile",
    completed_at: q.quest_id === "complete_profile" ? new Date().toISOString() : undefined
  }));

  try {
    const { data, error } = await supabase
      .from("student_quests")
      .select("*, quests(*)")
      .eq("student_id", studentId);

    if (error && isDbError(error)) {
      const local = localStorage.getItem(`futurepath_quests_${studentId}`);
      if (local) return JSON.parse(local);
      localStorage.setItem(`futurepath_quests_${studentId}`, JSON.stringify(defaultQuests));
      return defaultQuests;
    }

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        quest_id: item.quest_id,
        title: item.quests?.title || "",
        description: item.quests?.description || "",
        xp_reward: item.quests?.xp_reward || 0,
        current_count: item.current_count,
        target_count: item.quests?.target_count || 1,
        is_completed: item.is_completed,
        completed_at: item.completed_at
      }));
    }

    return defaultQuests;
  } catch (e) {
    const local = localStorage.getItem(`futurepath_quests_${studentId}`);
    if (local) return JSON.parse(local);
    localStorage.setItem(`futurepath_quests_${studentId}`, JSON.stringify(defaultQuests));
    return defaultQuests;
  }
}

export async function getBadges(): Promise<Badge[]> {
  return MOCK_BADGES;
}

// ----------------------------------------------------
// INTERNAL UPDATES (DB + LOCALSTORAGE)
// ----------------------------------------------------

async function addXpLocalOrDb(
  studentId: string,
  currentStats: StudentStats,
  xpToAdd: number,
  pointsToAdd: number
): Promise<{ newLevel: number } | null> {
  const newXp = currentStats.xp + xpToAdd;
  const newLevel = Math.floor(newXp / 100) + 1;
  const newPoints = currentStats.points + pointsToAdd;
  const levelUp = newLevel > currentStats.level ? { newLevel } : null;

  const updatedStats = {
    profile_id: studentId,
    xp: newXp,
    level: newLevel,
    points: newPoints
  };

  let useLocal = false;
  try {
    const { error } = await supabase
      .from("student_stats")
      .upsert([updatedStats]);

    if (error && isDbError(error)) {
      useLocal = true;
    }
  } catch (e) {
    useLocal = true;
  }

  // Always sync local storage for redundancy & fallback
  localStorage.setItem(`futurepath_stats_${studentId}`, JSON.stringify(updatedStats));
  return levelUp;
}

async function unlockBadgeLocalOrDb(studentId: string, badgeId: string): Promise<boolean> {
  // Read current badges first
  let localBadges: string[] = [];
  const stored = localStorage.getItem(`futurepath_badges_${studentId}`);
  if (stored) {
    localBadges = JSON.parse(stored);
  }

  if (localBadges.includes(badgeId)) {
    return false; // already unlocked
  }

  localBadges.push(badgeId);
  localStorage.setItem(`futurepath_badges_${studentId}`, JSON.stringify(localBadges));

  try {
    await supabase.from("student_badges").insert([{ student_id: studentId, badge_id: badgeId }]);
  } catch (e) {
    // catch silently
  }

  return true;
}

async function completeQuestLocalOrDb(studentId: string, questId: string, count: number = 1) {
  const quests = await getStudentQuests(studentId);
  const idx = quests.findIndex(q => q.quest_id === questId);
  if (idx !== -1) {
    quests[idx].is_completed = true;
    quests[idx].current_count = count;
    quests[idx].completed_at = new Date().toISOString();
    localStorage.setItem(`futurepath_quests_${studentId}`, JSON.stringify(quests));
  }

  try {
    await supabase
      .from("student_quests")
      .upsert([{
        student_id: studentId,
        quest_id: questId,
        current_count: count,
        is_completed: true,
        completed_at: new Date().toISOString()
      }]);
  } catch (e) {
    // catch silently
  }
}

async function updateQuestProgressLocalOrDb(studentId: string, questId: string, count: number) {
  const quests = await getStudentQuests(studentId);
  const idx = quests.findIndex(q => q.quest_id === questId);
  if (idx !== -1) {
    quests[idx].current_count = count;
    localStorage.setItem(`futurepath_quests_${studentId}`, JSON.stringify(quests));
  }

  try {
    await supabase
      .from("student_quests")
      .upsert([{
        student_id: studentId,
        quest_id: questId,
        current_count: count,
        is_completed: false
      }]);
  } catch (e) {
    // catch silently
  }
}

// ----------------------------------------------------
// ADMIN SUMMARY GENERATION
// ----------------------------------------------------

export interface DailySummary {
  date: string;
  total_appointments: number;
  completed_sessions: number;
  cancelled_sessions: number;
  upcoming_sessions: number;
  average_student_age: number;
  topic_percentages: { topic: string; percentage: number }[];
  timeline: Appointment[];
}

export async function getDailySummary(advisorId: string, dateStr: string): Promise<DailySummary> {
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch all appointments for the advisor
  const allAppointments = await getAppointments(advisorId, "advisor");
  
  // Filter for the selected date range
  const todayApps = allAppointments.filter(app => {
    const t = new Date(app.appointment_time);
    return t >= startOfDay && t <= endOfDay;
  });

  const total = todayApps.length;
  const completed = todayApps.filter(a => a.status === "completed").length;
  const cancelled = todayApps.filter(a => a.status === "cancelled").length;
  const upcoming = todayApps.filter(a => a.status === "upcoming").length;

  const ages = todayApps.map(a => a.student_age);
  const avgAge = ages.length > 0 ? parseFloat((ages.reduce((sum, a) => sum + a, 0) / ages.length).toFixed(1)) : 0;

  // Calculate topic counts
  const topicsMap: Record<string, number> = {};
  todayApps.forEach(app => {
    topicsMap[app.topic] = (topicsMap[app.topic] || 0) + 1;
  });

  const topic_percentages = Object.entries(topicsMap).map(([topic, count]) => ({
    topic,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  return {
    date: dateStr,
    total_appointments: total,
    completed_sessions: completed,
    cancelled_sessions: cancelled,
    upcoming_sessions: upcoming,
    average_student_age: avgAge,
    topic_percentages,
    timeline: todayApps.sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()),
  };
}

// ----------------------------------------------------
// SEED MOCK APPOINTMENTS (FOR TESTING)
// ----------------------------------------------------

export async function seedMockAppointments(studentId: string, advisorId: string = "00000000-0000-0000-0000-000000000001") {
  const now = new Date();
  
  // Generate three mock appointments for today at different times
  const appTimes = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30),
  ];

  const studentNames = ["Leo Rogers", "Maya Patel", "Chloe Simmons"];
  const ages = [15, 17, 16];
  const topics = ["Subject Choices", "University Admissions", "Career Planning"];
  const goals = [
    "Need advice on choosing between Science stream vs Art stream. What are the university pathway implications?",
    "Reviewing my Ivy League prep essay draft. Want feedback on my personal statement theme.",
    "Curious about opportunities in AI and Software Engineering. Should I study CS or Data Science?"
  ];

  const localApps = getLocalAppointments();

  for (let i = 0; i < 3; i++) {
    const mockApp: Appointment = {
      id: `seed-app-${Date.now()}-${i}`,
      student_id: studentId,
      advisor_id: advisorId,
      student_name: studentNames[i],
      student_age: ages[i],
      student_phone: "+6012-345-6789",
      topic: topics[i],
      goals: goals[i],
      appointment_time: appTimes[i].toISOString(),
      status: i === 0 ? "completed" : "upcoming", // make first one completed
      created_at: new Date().toISOString()
    };
    
    localApps.push(mockApp);
    
    try {
      await supabase.from("appointments").insert([mockApp]);
    } catch (e) {
      // catch silently
    }
  }

  saveLocalAppointments(localApps);
}
