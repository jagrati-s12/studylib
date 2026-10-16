// Types for the Personal Study Library application

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string; // lucide icon name
  sort_order: number;
  topic_count?: number;
  recent_topic?: string;
  updated_at?: string;
}

export type TopicStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Topic {
  id: string;
  subject_id: string;
  serial_number: number;
  title: string;
  sort_order: number;
  material_count?: number;
  updated_at: string;
  status?: TopicStatus;
  tags?: string[];
  progress?: number;
  checklist?: ChecklistItem[];
  note?: string;
  due_date?: string;
}

export type MaterialType = 'pdf' | 'ppt' | 'handwritten_image' | 'chatbot_note' | 'attachment';

export interface Material {
  id: string;
  topic_id: string;
  material_type: MaterialType;
  title: string;
  storage_key: string;
  mime_type: string;
  file_size_bytes: number;
  page_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface DigitalNote {
  id: string;
  topic_id: string;
  content: Record<string, unknown>; // Tiptap JSON
  updated_at: string;
}

export type WorkspaceLayoutMode = 'single' | 'split';

export interface WorkspaceSettings {
  id: string;
  user_id: string;
  topic_id: string;
  layout: WorkspaceLayoutMode;
left_material_id: string | null;
  right_material_id: string | null;
  left_page: number;
  right_page: number;
  left_zoom: number;
  right_zoom: number;
  preferences: Record<string, unknown>;
}

export interface ImportJob {
  id: string;
  subject_id: string;
  status: 'uploading' | 'processing' | 'preview' | 'confirmed' | 'failed';
  filename: string;
  extracted_entries: ImportEntry[];
  error?: string;
  created_at: string;
}

export interface ImportEntry {
  serial_number: number;
  title: string;
  selected: boolean;
  duplicate: boolean;
}

// Subject color presets
export const SUBJECT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#6366f1', // indigo
] as const;
