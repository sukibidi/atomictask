import { createClient } from '@supabase/supabase-js';

// Replace these strings with your actual Supabase configuration values
const SUPABASE_URL = 'https://bxeueidizowbjouvxlmd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXVlaWRpem93YmpvdXZ4bG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzUxNjYsImV4cCI6MjA5NjUxMTE2Nn0.-Al7JPqUTkbOv20WBru81rpYHjx6QlY-PraL_jMwEgM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);