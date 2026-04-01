# Airtel PPO Tracker - Complete Deployment Guide
## Vercel + Supabase (100% Free)

---

## STEP 1: Create Supabase Project

### 1.1 Sign Up
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended)

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Name**: `airtel-ppo-tracker`
   - **Database Password**: (save this somewhere!)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### 1.3 Run Database Setup SQL
1. In left sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Copy and paste this ENTIRE SQL:

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    password_changed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Weeks table
CREATE TABLE IF NOT EXISTS weeks (
    id TEXT PRIMARY KEY,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create Tasks table
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

-- Create Comments table
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
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);

-- Insert admin user (password: airtel123)
INSERT INTO users (email, password_hash, name, role, password_changed)
VALUES (
    'admin@airtel.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYF5S5HqKbHC',
    'Admin',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

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

-- Week 1 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t1-1', 'week-1', 'Read all SCM SOP documents and org chart', 1),
('t1-2', 'week-1', 'Meet Kushal Soni — understand expectations & KPIs', 2),
('t1-3', 'week-1', 'Map the full SCM vertical structure', 3),
('t1-4', 'week-1', 'Identify top 5 stakeholders to interview', 4),
('t1-5', 'week-1', 'Set up internship tracker / working document', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 2 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t2-1', 'week-2', 'Conduct 8–10 stakeholder interviews across SCM verticals', 1),
('t2-2', 'week-2', 'Map BAU workflows for top 3 SCM processes (SIPOC)', 2),
('t2-3', 'week-2', 'Identify all manual / repetitive steps', 3),
('t2-4', 'week-2', 'Create pain point log with Effort & Time scores', 4),
('t2-5', 'week-2', 'Share first week update PPT with Kushal Soni', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 3 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t3-1', 'week-3', 'Score each process: Effort, Time, Recurrence, Data Availability', 1),
('t3-2', 'week-3', 'Build Impact–Effort matrix for all identified pain points', 2),
('t3-3', 'week-3', 'Conduct 5-Whys on top 3 critical bottlenecks', 3),
('t3-4', 'week-3', 'Draft initial process flow diagrams', 4),
('t3-5', 'week-3', 'Identify quick-win automation opportunities', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 4 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t4-1', 'week-4', 'Research telecom SCM automation benchmarks', 1),
('t4-2', 'week-4', 'Identify AI/ML use cases applicable to Airtel SCM', 2),
('t4-3', 'week-4', 'Draft automation solution concepts for top 5 pain points', 3),
('t4-4', 'week-4', 'Prepare mid-internship update for Kushal Soni', 4),
('t4-5', 'week-4', 'Get feedback and realign scope if needed', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 5 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t5-1', 'week-5', 'Design detailed solution proposals for top 3 opportunities', 1),
('t5-2', 'week-5', 'Build Technology + Implementation roadmap per solution', 2),
('t5-3', 'week-5', 'Draft Cost-Benefit / ROI estimates', 3),
('t5-4', 'week-5', 'Create prototype or mock dashboard', 4),
('t5-5', 'week-5', 'Review with DT team for technical feasibility', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 6 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t6-1', 'week-6', 'Build use-case pipeline document for COE', 1),
('t6-2', 'week-6', 'Create structured templates: problem → solution → impact', 2),
('t6-3', 'week-6', 'Prioritize use cases for FY execution', 3),
('t6-4', 'week-6', 'Prepare business case document for 2–3 priority automations', 4),
('t6-5', 'week-6', 'Share structured docs with Kushal Soni for review', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 7 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t7-1', 'week-7', 'Complete end-to-end tracking framework', 1),
('t7-2', 'week-7', 'Finalize all process maps, pain point logs, solution designs', 2),
('t7-3', 'week-7', 'Build final internship impact report', 3),
('t7-4', 'week-7', 'Prepare executive summary (1-pager) for CXOs', 4),
('t7-5', 'week-7', 'Rehearse final presentation', 5)
ON CONFLICT (id) DO NOTHING;

-- Week 8 tasks
INSERT INTO tasks (id, week_id, title, position) VALUES
('t8-1', 'week-8', 'Deliver final presentation to leadership', 1),
('t8-2', 'week-8', 'Show: Problem → Analysis → Insights → Solutions → Impact', 2),
('t8-3', 'week-8', 'Highlight quantified business impact', 3),
('t8-4', 'week-8', 'Request feedback and express PPO interest', 4),
('t8-5', 'week-8', 'Send thank-you notes to all key stakeholders', 5)
ON CONFLICT (id) DO NOTHING;
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success" message

### 1.4 Get API Keys
1. In left sidebar, click **"Project Settings"** (gear icon)
2. Click **"API"** in the submenu
3. Copy these 3 values (you'll need them for Vercel):

| Key | Where to find |
|-----|---------------|
| **SUPABASE_URL** | Project URL (starts with https://) |
| **SUPABASE_ANON_KEY** | anon public (long string starting with eyJ) |
| **SUPABASE_SERVICE_KEY** | service_role (longer string starting with eyJ) |

⚠️ **Keep these keys secret!**

---

## STEP 2: Prepare Your Code

### 2.1 Download from Emergent
1. In Emergent, click **"Download Code"** button
2. Extract the ZIP file
3. Open the `vercel-app` folder (NOT the main folder)

### 2.2 Create GitHub Repository
1. Go to **https://github.com/new**
2. Name it: `airtel-ppo-tracker`
3. Keep it **Public** or **Private** (your choice)
4. Click **"Create repository"**

### 2.3 Push Code to GitHub
Open terminal in the `vercel-app` folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/airtel-ppo-tracker.git
git push -u origin main
```

---

## STEP 3: Deploy on Vercel

### 3.1 Sign Up / Login
1. Go to **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your `airtel-ppo-tracker` repository
3. Click **"Import"**

### 3.3 Configure Project Settings
On the "Configure Project" page:

| Setting | Value |
|---------|-------|
| **Project Name** | airtel-ppo-tracker |
| **Framework Preset** | Create React App |
| **Root Directory** | ./ (leave empty) |
| **Build Command** | yarn build |
| **Output Directory** | build |

### 3.4 Add Environment Variables
Click **"Environment Variables"** and add these ONE BY ONE:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | https://xxxxx.supabase.co (from Step 1.4) |
| `SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1Ni... (from Step 1.4) |
| `SUPABASE_SERVICE_KEY` | eyJhbGciOiJIUzI1Ni... (from Step 1.4) |
| `JWT_SECRET` | any-random-string-at-least-32-chars |
| `REACT_APP_BACKEND_URL` | (leave empty for now) |

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Once done, you'll see your URL like: `https://airtel-ppo-tracker.vercel.app`

### 3.6 Update Backend URL
1. Go to **Project Settings** → **Environment Variables**
2. Edit `REACT_APP_BACKEND_URL`
3. Set it to your Vercel URL: `https://airtel-ppo-tracker.vercel.app`
4. Click **"Save"**
5. Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

---

## STEP 4: Test Your App

### 4.1 Open Your App
Go to your Vercel URL: `https://airtel-ppo-tracker.vercel.app`

### 4.2 Login
- **Email**: admin@airtel.com
- **Password**: airtel123

### 4.3 If You See 404 Error
Check these things:
1. Make sure you uploaded the `vercel-app` folder content, not the parent folder
2. Check Vercel deployment logs for errors
3. Verify all environment variables are set correctly

---

## Troubleshooting

### "404 Not Found"
- Redeploy after setting REACT_APP_BACKEND_URL
- Check if build was successful in Vercel dashboard

### "Invalid login"
- Make sure you ran the SQL in Supabase
- Check if `users` table has the admin user

### "Network Error"
- Check SUPABASE_URL is correct
- Check SUPABASE_SERVICE_KEY is correct

### API Not Working
- Check Vercel Function Logs: Deployments → Logs
- Make sure all env variables are set

---

## Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@airtel.com | airtel123 |

---

## Your URLs
After deployment:
- **Frontend**: https://your-app.vercel.app
- **API**: https://your-app.vercel.app/api/*
- **Supabase**: https://xxxxx.supabase.co
