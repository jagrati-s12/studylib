// Types for the Personal Study Library application

export interface User {
  id;
  email;
  created_at;
}

export interface Subject {
  id;
  user_id;
  name;
  color;
  icon?; // lucide icon name
  sort_order;
  topic_count?;
  recent_topic?;
  updated_at?;
}

export type TopicStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface ChecklistItem {
  id;
  text;
  completed;
}

export interface Topic {
  id;
  subject_id;
  serial_number;
  title;
  sort_order;
  material_count?;
  updated_at;
  status?: TopicStatus;
  tags?[];
  progress?;
  checklist?: ChecklistItem[];
  note?;
  due_date?;
  subject_id_ref?;
  topic_id_ref?;
  /** A sub-index belongs to an index; root indexes have no parent. */
  parent_topic_id? | null;
  referenced_subject_name?;
  referenced_topic_title?;
}

export type MaterialType = 'pdf' | 'ppt' | 'handwritten_image' | 'chatbot_note' | 'attachment' | 'video' | 'link';

export interface Folder {
  id;
  topic_id;
  name;
  parent_folder_id | null;
  kind?: 'default' | 'custom';
  created_at;
}

export interface Material {
  id;
  topic_id;
  material_type: MaterialType;
  title;
  storage_key;
  mime_type;
  file_size_bytes;
  page_count | null;
  created_at;
  updated_at;
  folder_id? | null;
  url? | null;
}

export interface DigitalNote {
  id;
  topic_id;
  content: Record<string, unknown>; // Tiptap JSON
  updated_at;
  title?;
  folder_id? | null;
}

export type WorkspaceLayoutMode = 'single' | 'split' | 'triple' | 'quad';

export interface WorkspacePanelState {
  item_id | null;
  page;
  zoom;
}

export interface WorkspaceSettings {
  id;
  user_id;
  topic_id;
  layout: WorkspaceLayoutMode;
  left_material_id | null;
  right_material_id | null;
  left_page;
  right_page;
  left_zoom;
  right_zoom;
  preferences: Record<string, unknown>;
  panels?: WorkspacePanelState[];
}

export interface ImportJob {
  id;
  subject_id;
  status: 'uploading' | 'processing' | 'preview' | 'confirmed' | 'failed';
  filename;
  extracted_entries: ImportEntry[];
  error?;
  created_at;
}

export interface ImportEntry {
  serial_number;
  title;
  selected;
  duplicate;
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

