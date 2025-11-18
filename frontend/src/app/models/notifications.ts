export interface Notification {
  noti_id: number;
  user_id: number;
  type: string;
  title: string;
  noti_content: string | null;
  entity_type: string;
  entity_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    total_pages: number;
    has_more: boolean;
  };
}
