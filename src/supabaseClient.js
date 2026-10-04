import { createClient } from '@supabase/supabase-js';

// URL dasar Supabase tanpa tambahan /rest/v1/ di belakangnya
const SUPABASE_URL = 'https://ztselukhyipakqvhhmtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0c2VsdWtoeWlwYWtxdmhobXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjM0NDIsImV4cCI6MjEwNTYzOTQ0Mn0.71jAqrHavn77tmreRNKLgywg9WCpRFT1wddPpM0Q-Og';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);