"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  role: "student" | "advisor";
  specialty?: string;
  bio?: string;
  avatar_url?: string;
}

export interface StudentStats {
  profile_id: string;
  xp: number;
  level: number;
  points: number;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  stats: StudentStats | null;
  badges: string[]; // List of badge IDs
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role: "student" | "advisor", specialty?: string, bio?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loginAsMock: (role: "student" | "advisor") => void;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  // Check if we are running in mock mode based on localStorage
  useEffect(() => {
    const mockSession = localStorage.getItem("futurepath_mock_session");
    if (mockSession) {
      try {
        const sessionData = JSON.parse(mockSession);
        setUser({ id: sessionData.profile.id, email: sessionData.email });
        setProfile(sessionData.profile);
        setIsMock(true);
        if (sessionData.profile.role === "student") {
          loadMockStats(sessionData.profile.id);
        }
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("futurepath_mock_session");
      }
    }

    // Standard Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user);
          setIsMock(false);
          await loadSupabaseProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setStats(null);
          setBadges([]);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadMockStats = (studentId: string) => {
    const localStats = localStorage.getItem(`futurepath_stats_${studentId}`);
    if (localStats) {
      setStats(JSON.parse(localStats));
    } else {
      const defaultStats = { profile_id: studentId, xp: 100, level: 2, points: 50 };
      localStorage.setItem(`futurepath_stats_${studentId}`, JSON.stringify(defaultStats));
      setStats(defaultStats);
    }

    const localBadges = localStorage.getItem(`futurepath_badges_${studentId}`);
    if (localBadges) {
      setBadges(JSON.parse(localBadges));
    } else {
      // Default: no badges unlocked
      localStorage.setItem(`futurepath_badges_${studentId}`, JSON.stringify([]));
      setBadges([]);
    }
  };

  const loadSupabaseProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profiles query failed, falling back to mock profile:", error);
        fallbackToMockUser(userId);
      } else if (data) {
        setProfile(data);
        if (data.role === "student") {
          await loadSupabaseStats(userId);
        }
      }
    } catch (e) {
      console.error("Failed to load profile from Supabase:", e);
      fallbackToMockUser(userId);
    }
  };

  const fallbackToMockUser = (userId: string) => {
    // If profiles query fails (table missing), generate a mock profile for this session
    const mockProfile: UserProfile = {
      id: userId,
      name: "Demo Student",
      role: "student",
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
    };
    setProfile(mockProfile);
    loadMockStats(userId);
  };

  const loadSupabaseStats = async (studentId: string) => {
    try {
      const { data: statsData, error: statsError } = await supabase
        .from("student_stats")
        .select("*")
        .eq("profile_id", studentId)
        .single();

      if (!statsError && statsData) {
        setStats(statsData);
      } else {
        // Stats table missing or error, initialize local storage stats
        loadMockStats(studentId);
      }

      const { data: badgesData, error: badgesError } = await supabase
        .from("student_badges")
        .select("badge_id")
        .eq("student_id", studentId);

      if (!badgesError && badgesData) {
        setBadges(badgesData.map((b: any) => b.badge_id));
      }
    } catch (e) {
      console.error("Error loading stats from Supabase:", e);
      loadMockStats(studentId);
    }
  };

  const refreshStats = async () => {
    if (isMock && user) {
      loadMockStats(user.id);
    } else if (user) {
      await loadSupabaseStats(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "advisor",
    specialty?: string,
    bio?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, specialty, bio }
        }
      });

      if (error) return { error };

      // Manually create profile in public schema as backup if database triggers are missing or failed
      if (data?.user) {
        try {
          const profileData: UserProfile = {
            id: data.user.id,
            name,
            role,
            specialty,
            bio,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`
          };
          await supabase.from("profiles").insert([profileData]);
          if (role === "student") {
            await supabase.from("student_stats").insert([{ profile_id: data.user.id, xp: 100, level: 2, points: 50 }]);
            // Seed quests
            await supabase.from("student_quests").insert([
              { student_id: data.user.id, quest_id: "complete_profile", current_count: 1, is_completed: true },
              { student_id: data.user.id, quest_id: "first_booking", current_count: 0, is_completed: false },
              { student_id: data.user.id, quest_id: "first_session", current_count: 0, is_completed: false },
              { student_id: data.user.id, quest_id: "deep_explorer", current_count: 0, is_completed: false }
            ]);
          }
        } catch (dbErr) {
          console.warn("Direct profile insert failed, relying on trigger or fallback:", dbErr);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isMock) {
      localStorage.removeItem("futurepath_mock_session");
      setUser(null);
      setProfile(null);
      setStats(null);
      setBadges([]);
      setIsMock(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  const loginAsMock = (role: "student" | "advisor") => {
    const mockId = role === "student" ? "mock-student-id-1234" : "00000000-0000-0000-0000-000000000001";
    const mockProfile: UserProfile = role === "student" 
      ? {
          id: mockId,
          name: "Alex Mercer",
          role: "student",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex"
        }
      : {
          id: mockId,
          name: "Dr. Aris Chen",
          role: "advisor",
          specialty: "University Admissions",
          bio: "Former Yale admissions officer helping students craft standout applications.",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=aris"
        };

    const sessionData = {
      email: role === "student" ? "alex@futurepath.com" : "advisor1@futurepath.com",
      profile: mockProfile
    };

    localStorage.setItem("futurepath_mock_session", JSON.stringify(sessionData));
    setUser({ id: mockId, email: sessionData.email });
    setProfile(mockProfile);
    setIsMock(true);
    
    if (role === "student") {
      loadMockStats(mockId);
    } else {
      setStats(null);
      setBadges([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        stats,
        badges,
        loading,
        isMock,
        signIn,
        signUp,
        signOut,
        loginAsMock,
        refreshStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
