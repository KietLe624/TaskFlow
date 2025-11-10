export interface TaskAssignee {
  user_id: number;
  username: string;
  avatar_url: string;
  full_name?: string;
}

export interface Tasks {
  task_id: number;
  task_name: string;
  parent_id?: number | null;
  description?: string;
  status: string;
  priority: string;
  start_date?: Date;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  assignee?: TaskAssignee;
  project_id?: number;
}
