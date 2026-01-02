export interface Profile {
  id: string; // references auth.users.id
  full_name: string | null;
  institution: string | null;
  birth_date?: string | null;
  address?: string | null;
  academic_role?: 'estudante' | 'professor' | 'investigador' | null;
  research_areas: string[] | null;
  user_type: 'researcher' | 'editor' | 'admin';
  avatar_url?: string;
}

export interface Publication {
  id: string;
  user_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  scientific_area: string;
  file_url: string;
  publish_date: string;
  created_at: string;
  approved: boolean;
  profiles?: Profile; // Joined data
  views?: number; // Calculated or joined
  downloads?: number;
}

export interface Statistics {
  publication_id: string;
  views: number;
  downloads: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}