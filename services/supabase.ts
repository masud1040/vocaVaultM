import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsmqwjceewxnutrcbokw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXF3amNlZXd4bnV0cmNib2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjU5MTUsImV4cCI6MjA4NzQ0MTkxNX0.2vRViomHXDvOFoeVsEE4xHs0Y0_eRW_PAuX-8CFCPeY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
