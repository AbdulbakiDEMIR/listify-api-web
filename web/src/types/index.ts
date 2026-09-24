export type ListType = 'shopping' | 'todo';

export interface ListItem {
  id: string;
  list_id: string;
  name: string;
  category: string;
  is_completed: boolean;
  updated_at: number; // UTC milisaniye damgası
  is_deleted: boolean;
}

export interface List {
  id: string;
  title: string;
  type: ListType;
  sync_token?: string;
  clone_token?: string;
  is_synced?: boolean;
  version?: number;
  expires_at?: string;
  created_at: number;
  updated_at: number;
}

export interface ListTemplate {
  id: string;
  title: string;
  type: ListType;
  description: string;
  items: Array<{ name: string; category?: string }>;
}

export interface ShareResponse {
  sync_token: string;
  clone_token: string;
  expires_at: string;
}
