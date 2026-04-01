-- Supabase SQL Setup for Airtel PPO Tracker
-- Run this in Supabase SQL Editor

-- Enable pgcrypto for password hashing (required)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    password_changed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weeks table
CREATE TABLE IF NOT EXISTS weeks (
    id TEXT PRIMARY KEY,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    week_id TEXT REFERENCES weeks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_mentor_comment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    created_by_name TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_week_id ON tasks(week_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- Insert admin user (password: airtel123)
-- Hash generated with pgcrypto crypt() so verify_user_password works
INSERT INTO users (id, email, password_hash, name, role, password_changed)
VALUES (
    gen_random_uuid(),
    'admin@airtel.com',
    crypt('airtel123', gen_salt('bf')),
    'Admin',
    'admin',
    TRUE
) ON CONFLICT (email) DO UPDATE SET password_hash = crypt('airtel123', gen_salt('bf'));

-- Insert 8 weeks
INSERT INTO weeks (id, week_number, title) VALUES
('week-1', 1, 'Onboarding & Context Setting'),
('week-2', 2, 'Process Discovery & Mapping'),
('week-3', 3, 'Deep-Dive Assessment'),
('week-4', 4, 'Benchmarking & Ideation'),
('week-5', 5, 'Solution Design'),
('week-6', 6, 'COE Handoff Framework'),
('week-7', 7, 'Final Deliverables'),
('week-8', 8, 'Final Presentation & PPO Push')
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 1
INSERT INTO tasks (id, week_id, title, position) VALUES
('t1-1', 'week-1', 'Read all SCM SOP documents and org chart', 1),
('t1-2', 'week-1', 'Meet Kushal Soni — understand expectations & KPIs', 2),
('t1-3', 'week-1', 'Map the full SCM vertical structure', 3),
('t1-4', 'week-1', 'Identify top 5 stakeholders to interview', 4),
('t1-5', 'week-1', 'Set up internship tracker / working document', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 2
INSERT INTO tasks (id, week_id, title, position) VALUES
('t2-1', 'week-2', 'Conduct 8–10 stakeholder interviews across SCM verticals', 1),
('t2-2', 'week-2', 'Map BAU workflows for top 3 SCM processes (SIPOC)', 2),
('t2-3', 'week-2', 'Identify all manual / repetitive steps', 3),
('t2-4', 'week-2', 'Create pain point log with Effort & Time scores', 4),
('t2-5', 'week-2', 'Share first week update PPT with Kushal Soni', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 3
INSERT INTO tasks (id, week_id, title, position) VALUES
('t3-1', 'week-3', 'Score each process: Effort, Time, Recurrence, Data Availability, Automation Feasibility', 1),
('t3-2', 'week-3', 'Build Impact–Effort matrix for all identified pain points', 2),
('t3-3', 'week-3', 'Conduct 5-Whys on top 3 critical bottlenecks', 3),
('t3-4', 'week-3', 'Draft initial process flow diagrams', 4),
('t3-5', 'week-3', 'Identify quick-win automation opportunities', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 4
INSERT INTO tasks (id, week_id, title, position) VALUES
('t4-1', 'week-4', 'Research telecom SCM automation benchmarks (global & India)', 1),
('t4-2', 'week-4', 'Identify AI/ML use cases applicable to Airtel SCM', 2),
('t4-3', 'week-4', 'Draft automation solution concepts for top 5 pain points', 3),
('t4-4', 'week-4', 'Prepare mid-internship update for Kushal Soni', 4),
('t4-5', 'week-4', 'Get feedback and realign scope if needed', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 5
INSERT INTO tasks (id, week_id, title, position) VALUES
('t5-1', 'week-5', 'Design detailed solution proposals for top 3 automation opportunities', 1),
('t5-2', 'week-5', 'Build Technology + Implementation roadmap per solution', 2),
('t5-3', 'week-5', 'Draft Cost-Benefit / ROI estimates', 3),
('t5-4', 'week-5', 'Create prototype or mock dashboard (Excel/Power BI/Figma)', 4),
('t5-5', 'week-5', 'Review with DT team for technical feasibility', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 6
INSERT INTO tasks (id, week_id, title, position) VALUES
('t6-1', 'week-6', 'Build use-case pipeline document for COE', 1),
('t6-2', 'week-6', 'Create structured templates: problem → solution → impact → effort → next steps', 2),
('t6-3', 'week-6', 'Prioritize use cases for FY execution', 3),
('t6-4', 'week-6', 'Prepare business case document for 2–3 priority automations', 4),
('t6-5', 'week-6', 'Share structured docs with Kushal Soni for review', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 7
INSERT INTO tasks (id, week_id, title, position) VALUES
('t7-1', 'week-7', 'Complete end-to-end tracking framework', 1),
('t7-2', 'week-7', 'Finalize all process maps, pain point logs, solution designs', 2),
('t7-3', 'week-7', 'Build final internship impact report', 3),
('t7-4', 'week-7', 'Prepare executive summary (1-pager) for CXOs', 4),
('t7-5', 'week-7', 'Rehearse final presentation — Pyramid Principle / SCQA structure', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default tasks for Week 8
INSERT INTO tasks (id, week_id, title, position) VALUES
('t8-1', 'week-8', 'Deliver final presentation to leadership', 1),
('t8-2', 'week-8', 'Show: Problem → Analysis → Insights → Solutions → Impact → Roadmap', 2),
('t8-3', 'week-8', 'Highlight quantified business impact (time saved, cost, efficiency %)', 3),
('t8-4', 'week-8', 'Request feedback and express PPO interest', 4),
('t8-5', 'week-8', 'Send thank-you notes to all key stakeholders', 5)
ON CONFLICT (id) DO NOTHING;

-- Grant table access to anon and authenticated roles
-- (Required when tables are created via SQL editor — not granted automatically)
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON weeks TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON comments TO anon, authenticated;

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_password(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon, authenticated;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for all access (DROP first to allow safe re-run)
DROP POLICY IF EXISTS "Allow all for authenticated" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated" ON weeks;
DROP POLICY IF EXISTS "Allow all for authenticated" ON tasks;
DROP POLICY IF EXISTS "Allow all for authenticated" ON comments;

CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- RPC FUNCTIONS (required by the app — were missing before)
-- ============================================================

-- Verify a user's password
CREATE OR REPLACE FUNCTION verify_user_password(user_email TEXT, user_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM users
  WHERE email = lower(user_email);

  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN stored_hash = crypt(user_password, stored_hash);
END;
$$;

-- Create a new user with a hashed password
CREATE OR REPLACE FUNCTION create_user_with_password(
  user_id UUID,
  user_email TEXT,
  user_password TEXT,
  user_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, email, password_hash, name, role, password_changed)
  VALUES (
    user_id,
    lower(user_email),
    crypt(user_password, gen_salt('bf')),
    user_name,
    'user',
    FALSE
  );
END;
$$;

-- Update a user's password
CREATE OR REPLACE FUNCTION update_user_password(user_email TEXT, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET password_hash = crypt(new_password, gen_salt('bf')),
      password_changed = TRUE
  WHERE email = lower(user_email);
END;
$$;
