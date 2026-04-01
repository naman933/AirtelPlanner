import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email, password) => {
  // Custom auth - check against users table
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !users) {
    throw new Error('Invalid email or password');
  }

  // For demo purposes, we'll do a simple check
  // In production, you'd use Supabase Auth or verify bcrypt hash on backend
  const { data: authData, error: authError } = await supabase.rpc('verify_password', {
    input_email: email.toLowerCase(),
    input_password: password
  });

  if (authError || !authData) {
    throw new Error('Invalid email or password');
  }

  return users;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('ppo_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('ppo_user', JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem('ppo_user');
};

// Weeks API
export const getWeeks = async () => {
  const { data: weeks, error } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number');

  if (error) throw error;

  // Get tasks for each week
  for (const week of weeks) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('week_id', week.id)
      .order('position');

    // Get comments for each task
    for (const task of tasks || []) {
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at');
      task.comments = comments || [];
    }

    week.tasks = tasks || [];
  }

  return weeks;
};

export const updateWeek = async (weekId, updates) => {
  const { data, error } = await supabase
    .from('weeks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', weekId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Tasks API
export const createTask = async (weekId, title, dueDate, userId) => {
  // Get max position
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('week_id', weekId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPos = existing?.[0]?.position || 0;
  const taskId = `task-${Date.now()}`;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      id: taskId,
      week_id: weekId,
      title,
      completed: false,
      due_date: dueDate,
      position: maxPos + 1,
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;
  data.comments = [];
  return data;
};

export const updateTask = async (taskId, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTask = async (taskId) => {
  // Delete comments first
  await supabase.from('comments').delete().eq('task_id', taskId);
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
};

export const reorderTasks = async (weekId, taskIds) => {
  for (let i = 0; i < taskIds.length; i++) {
    await supabase
      .from('tasks')
      .update({ position: i })
      .eq('id', taskIds[i]);
  }
};

// Comments API
export const addComment = async (taskId, text, userId, userName, isMentor = false) => {
  const commentId = `comment-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      id: commentId,
      task_id: taskId,
      text,
      is_mentor_comment: isMentor,
      created_by: userId,
      created_by_name: userName
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

// Users API (admin only)
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role');

  if (error) throw error;
  return data;
};

export const createUser = async (email, password, name) => {
  const userId = crypto.randomUUID();
  
  // Store password hash using Supabase function
  const { data, error } = await supabase.rpc('create_user_with_password', {
    user_id: userId,
    user_email: email.toLowerCase(),
    user_password: password,
    user_name: name
  });

  if (error) throw error;
  return { id: userId, email: email.toLowerCase(), name, role: 'user' };
};

export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};
