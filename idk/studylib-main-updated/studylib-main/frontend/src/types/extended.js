// Extended types for Schedule/Calendar feature
export interface CalendarEvent {
  id;
  title;
  description?;
  start; // ISO datetime
  end; // ISO datetime
  color?;
  attendees?[];
  topic_id?; // Link to a study topic
  subject_id?;
}

export type CalendarView = 'daily' | 'weekly' | 'monthly';

export interface CalendarFilter {
  meetings;
  taskDueDates;
  milestones;
  deadlines;
  personalEvents;
  birthdays;
}

// Extended types for Notes feature
export interface Note {
  id;
  subject_id;
  title;
  content: Record<string, unknown>; // Tiptap/rich text JSON
  attachments?: NoteAttachment[];
  created_at;
  updated_at;
  color?;
  tags?[];
}

export interface NoteAttachment {
  id;
  note_id;
  type: 'image' | 'ppt' | 'pdf' | 'doc' | 'other';
  title;
  url;
  size_bytes;
  created_at;
}

