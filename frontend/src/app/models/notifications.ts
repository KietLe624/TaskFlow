export interface Notification {
  noti_id: number;
  user_id: number;
  type?: 'task' | 'mention' | 'comment' | 'system';
  title: string;
  noti_content: string | null;
  entity_type: string;
  entity_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    total_pages: number;
    has_more: boolean;
  };
}
export interface NotificationDetail {
  noti_id: string;
  title: string;
  noti_content: string;
  entity_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}
