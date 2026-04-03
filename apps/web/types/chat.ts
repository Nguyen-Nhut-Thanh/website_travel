export type RecommendedTour = {
  tour_id: number;
  name: string;
  price: number;
  duration_days: number;
  image_url: string | null;
  destination?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "admin";
  content: string;
  message_type?: "TEXT" | "IMAGE";
  recommended_tours?: RecommendedTour[];
  created_at?: string;
  sender_role?: string;
};

export type PendingImage = {
  file: File;
  previewUrl: string;
};

export type Conversation = {
  conversation_id: number;
  user_id: number;
  status: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  users?: {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

export type RealtimeMessage = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: "USER" | "ADMIN" | "STAFF";
  message_type: "TEXT" | "IMAGE";
  content: string;
  is_read: boolean;
  created_at: string;
};
