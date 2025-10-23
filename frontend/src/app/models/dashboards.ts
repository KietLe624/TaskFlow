export interface TaskSummary {
  newTasks: number;
  tasksDone: number;
}

export interface OverviewTasks {
  id: string;
  status: string;
  date: string;
  title: string;
  description: string;
  assignees: { avatarUrl: string, username: string }[];
  progressText: string;
}

export interface PendingProject {
  id: string;
  title: string;
  progressPercent: number;
  taskCount: string;
  attachmentCount: number;
  dueDate: string;
  colorClass: string;
  iconClass: string;
}

export interface Activity {
  id: string;
  userAvatar: string;
  userName: string;
  action: string;
  timeAgo: string;
  time: string;
}

export interface ActivityGroup {
  date: string;
  items: Activity[];
}

export interface DashboardData {
  taskSummary: TaskSummary;
  overviewTasks: OverviewTasks[];
  pendingProjects: PendingProject[];
  latestActivities: ActivityGroup[];
}
