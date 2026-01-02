import { createClient } from '@supabase/supabase-js';

// Using the keys provided in the prompt
const supabaseUrl = 'https://elugwsobstwmrowraohk.supabase.co';
const supabaseAnonKey = 'sb_publishable_YGapH0KuH2ig5ap5YPtG_Q_X69zrSCw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);