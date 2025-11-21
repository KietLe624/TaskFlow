// profile.model.ts
export interface ProfileResponse {
  message: string;
  data: ProfileData;
}

// Dùng cái này trong component (sạch sẽ nhất)
export interface ProfileData {
  user: UserProfile;
  stats: ProfileStats;
  recentActivities: Activity[];
  teams: UserTeam[];
}

export interface UserProfile {
  user_id: number;
  username: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  tasksCompleted: number;
  projects: number;
  teams: number;
}

export interface Activity {
  activity_id: number;
  entity_type: 'task' | 'project' | 'team';
  entity_id: number;
  action: string;
  description: string;
  created_at: string;
  project?: {
    project_name: string;
  } | null;
}

export interface UserTeam {
  team_id: number;
  team_name: string;
  role: 'owner' | 'admin' | 'member';
}

