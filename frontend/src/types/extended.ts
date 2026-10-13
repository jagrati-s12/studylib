// Extended types for Schedule/Calendar feature
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  color?: string;
  attendees?: string[];
  topic_id?: string; // Link to a study topic
  subject_id?: string;
}

export type CalendarView = 'daily' | 'weekly' | 'monthly';

export interface CalendarFilter {
  meetings: boolean;
  taskDueDates: boolean;
  milestones: boolean;
  deadlines: boolean;
  personalEvents: boolean;
  birthdays: boolean;
}

// Extended types for Notes feature
export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: Record<string, unknown>; // Tiptap/rich text JSON
  attachments?: NoteAttachment[];
  created_at: string;
  updated_at: string;
  color?: string;
  tags?: string[];
}

export interface NoteAttachment {
  id: string;
  note_id: string;
  type: 'image' | 'ppt' | 'pdf' | 'doc' | 'other';
  title: string;
  url: string;
  size_bytes: number;
  created_at: string;
}
