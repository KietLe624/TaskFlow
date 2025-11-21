export const NotificationConfig: Record<string, { icon: string; color: string; bg: string; route: string }> = {
  // 1. Công việc (Task)
  task: {
    icon: 'fa-solid fa-list-check',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    route: '/app/tasks'
  },

  // 2. Dự án (Project)
  project: {
    icon: 'fa-solid fa-folder-open',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    route: '/app/projects'
  },

  // 3. Comment (Thường dẫn về task)
  comment: {
    icon: 'fa-regular fa-comments',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    route: '/app/tasks'
  },

  // 4. Mention (Được nhắc tên)
  mention: {
    icon: 'fa-solid fa-at',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    route: '/app/tasks'
  },

  // 5. Team
  team: {
    icon: 'fa-solid fa-users',
    color: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    route: '/app/teams'
  },

  // 6. Mặc định (System)
  system: {
    icon: 'fa-solid fa-bullhorn',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    route: '/app/notifications'
  }

};
