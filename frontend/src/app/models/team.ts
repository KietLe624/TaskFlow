export interface Team {
  team_id: number;
  team_name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  members?: TeamMember[];
}

export interface TeamMember {
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
}
