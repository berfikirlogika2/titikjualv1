import { createClient } from '@supabase/supabase-js';

// URL dasar Supabase tanpa tambahan /rest/v1/ di belakangnya
const SUPABASE_URL = 'https://dwgyvirhjeivwaazzemc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3l2aXJoamVpdndhYXp6ZW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTgxNjUsImV4cCI6MjEwNjY3NDE2NX0.uXLXlqoVM8BmYwAUVEzysHmtq5SbN09HnT1LHTQuuVU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);