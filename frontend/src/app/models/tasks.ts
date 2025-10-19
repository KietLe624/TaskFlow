export interface Tasks {
  task_id: number;
  task_name: string;
  parent_id?: number;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  start_date?: Date;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  assigned_to?: number; // user_id of the assigned user
  project_id?: number; // project_id of the associated project
}
