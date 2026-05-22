-- FuturePath Booking & Gamification Schema Setup
-- Run this in your Supabase SQL Editor to set up your tables, triggers, and seed data.

-- 1. CLEANUP (Optional)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.student_quests CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.student_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.student_stats CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE TABLES

-- Public Profiles Table (shares ID with auth.users for authenticated users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'advisor')) DEFAULT 'student' NOT NULL,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments Table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  student_age INTEGER NOT NULL,
  student_phone TEXT,
  topic TEXT NOT NULL,
  goals TEXT,
  appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Student Stats Table (for gamification progression)
CREATE TABLE public.student_stats (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL
);

-- Badges Table
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0 NOT NULL
);

-- Student Badges Table (unlocked achievements)
CREATE TABLE public.student_badges (
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (student_id, badge_id)
);

-- Quests Table
CREATE TABLE public.quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0 NOT NULL,
  target_count INTEGER DEFAULT 1 NOT NULL
);

-- Student Quests Table (tracks active quest progress)
CREATE TABLE public.student_quests (
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
  current_count INTEGER DEFAULT 0 NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (student_id, quest_id)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quests ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES

-- Profiles policies
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profiles (for seeding/signup)" ON public.profiles
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Appointments are viewable by participants" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR auth.uid() = advisor_id);

CREATE POLICY "Students can book appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = student_id OR auth.uid() = advisor_id);

-- Student Stats policies
CREATE POLICY "Stats are viewable by public" ON public.student_stats
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Students can update their own stats" ON public.student_stats
  FOR UPDATE TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "System can insert stats" ON public.student_stats
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Badges policies
CREATE POLICY "Badges are viewable by everyone" ON public.badges
  FOR SELECT TO authenticated, anon USING (true);

-- Student Badges policies
CREATE POLICY "Student badges are viewable by everyone" ON public.student_badges
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Students can insert their earned badges" ON public.student_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

-- Quests policies
CREATE POLICY "Quests are viewable by everyone" ON public.quests
  FOR SELECT TO authenticated, anon USING (true);

-- Student Quests policies
CREATE POLICY "Student quests are viewable by owner" ON public.student_quests
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students can update their quest progress" ON public.student_quests
  FOR UPDATE TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Students can initialize quest progress" ON public.student_quests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

-- 5. TRIGGER ON NEW AUTH SIGNUP
-- Automatically creates a profile and starts gamification for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
  v_avatar TEXT;
BEGIN
  -- Get metadata or fallbacks
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  v_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url', 
    'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id::text
  );

  -- Insert or update profile
  INSERT INTO public.profiles (id, user_id, name, role, avatar_url)
  VALUES (new.id, new.id, v_name, v_role, v_avatar)
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  -- Initialize student stats and quests if user is a student
  IF v_role = 'student' THEN
    -- Student Stats initialization (grants 100 XP for signing up!)
    INSERT INTO public.student_stats (profile_id, xp, level, points)
    VALUES (new.id, 100, 2, 50)
    ON CONFLICT (profile_id) DO NOTHING;

    -- Seed completed signup quest
    INSERT INTO public.student_quests (student_id, quest_id, current_count, is_completed, completed_at)
    VALUES (new.id, 'complete_profile', 1, true, now())
    ON CONFLICT (student_id, quest_id) DO NOTHING;

    -- Seed active/pending quests
    INSERT INTO public.student_quests (student_id, quest_id, current_count, is_completed)
    VALUES 
      (new.id, 'first_booking', 0, false),
      (new.id, 'first_session', 0, false),
      (new.id, 'deep_explorer', 0, false)
    ON CONFLICT (student_id, quest_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. SEED DATA

-- Seed Quests
INSERT INTO public.quests (id, title, description, xp_reward, target_count) VALUES
  ('complete_profile', 'Kickstart Your Journey', 'Register a profile on FuturePath', 100, 1),
  ('first_booking', 'The First Step', 'Book your first advising session', 150, 1),
  ('first_session', 'Meet Your Mentor', 'Complete your first career advice session', 250, 1),
  ('deep_explorer', 'Deep Explorer', 'Attend advising sessions with 2 different advisors', 200, 2)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward,
  target_count = EXCLUDED.target_count;

-- Seed Badges
INSERT INTO public.badges (id, name, description, icon_name, xp_reward) VALUES
  ('first_step', 'First Step', 'Booked your first consultation session', 'Compass', 50),
  ('knowledge_seeker', 'Knowledge Seeker', 'Completed your first career advice session', 'BookOpen', 100),
  ('goal_crusher', 'Goal Crusher', 'Completed a session with focused goals achieved', 'Award', 100),
  ('polymath', 'Polymath Explorer', 'Consulted with multiple advisors across different topics', 'Layers', 150)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  xp_reward = EXCLUDED.xp_reward;

-- Seed Advisors (Seed profiles directly since they are not bound to auth accounts for general demo browsing)
INSERT INTO public.profiles (id, name, role, specialty, bio, avatar_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Aris Chen', 'advisor', 'University Admissions', 'Former Yale admissions officer helping students craft standout applications and secure elite scholarships.', 'https://api.dicebear.com/7.x/adventurer/svg?seed=aris'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'advisor', 'Career Planning', 'Tech talent recruiter specialized in career transition, resume crafting, and corporate internship mapping.', 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah'),
  ('00000000-0000-0000-0000-000000000003', 'Coach Marcus Vance', 'advisor', 'Subject Selection & Study Skills', 'High school academic counselor sharing learning strategies, time management habits, and subject streams.', 'https://api.dicebear.com/7.x/adventurer/svg?seed=marcus'),
  ('00000000-0000-0000-0000-000000000004', 'Elena Rostova', 'advisor', 'Interview Prep & Speaking', 'Public speaking coach and university interviewer preparing teenagers for high-stress admission panels.', 'https://api.dicebear.com/7.x/adventurer/svg?seed=elena')
ON CONFLICT (id) DO NOTHING;
