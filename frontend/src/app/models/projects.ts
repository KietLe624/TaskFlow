import { Tasks } from './tasks';
import { Team } from './team';

export interface Project {
  project_id: number;
  project_name: string;
  description?: string;
  status: string;
  progressPercent: number;
  team?: Team;
  members?: ProjectMember[];
  due_date: string;
  start_date: string;
  client?: string;
  budget?: number;
  priority: string;
  isStarred?: boolean;
  taskCount: number;
  activityCount?: number;
  tasks?: Tasks[];
}

export interface ProjectMember {
  user_id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
}

export interface CreateProjectPayload {
  project_name: string;
  description?: string;
  status: string;
  priority: string;
  client?: string;
  budget?: number;
  start_date: string;
  due_date: string;
  team_id?: number;
}

export interface ProjectDetail {
  project_id: number;
  project_name?: string;
  description?: string;
  status?: string;
  priority?: string;
  client?: string;
  budget?: number;
  start_date?: string;
  due_date?: string;
  members?: ProjectMember[];
}

