import { mockApi } from './mock-data';
import type { Topic, Subject, Material, DigitalNote, WorkspaceSettings, Folder } from '@/types';

export const api = {
  getSubjects: (): Promise<Subject[]> => mockApi.getSubjects(),
  getSubject: (id: string): Promise<Subject | null> => mockApi.getSubject(id),
  createSubject: (data: { name: string; color: string; icon?: string }): Promise<Subject> => mockApi.createSubject(data),
  updateSubject: (id: string, data: Partial<Subject>): Promise<Subject> => mockApi.updateSubject(id, data),
  deleteSubject: (id: string): Promise<void> => mockApi.deleteSubject(id),
  getAllTopics: (): Promise<Topic[]> => mockApi.getAllTopics(),
  getTopics: (subjectId: string): Promise<Topic[]> => mockApi.getTopics(subjectId),
  getTopic: (id: string): Promise<Topic | null> => mockApi.getTopic(id),
  createTopic: (subjectId: string, data: { serial_number: number; title: string; parent_topic_id?: string | null; status?: Topic['status']; tags?: string[]; subject_id_ref?: string; topic_id_ref?: string; referenced_subject_name?: string; referenced_topic_title?: string; checklist?: Topic['checklist']; note?: string; due_date?: string }): Promise<Topic> => mockApi.createTopic(subjectId, data),
  updateTopic: (id: string, data: Partial<Topic>): Promise<Topic> => mockApi.updateTopic(id, data),
  deleteTopic: (id: string): Promise<void> => mockApi.deleteTopic(id),
  getMaterials: (topicId: string): Promise<Material[]> => mockApi.getMaterials(topicId),
  uploadMaterial: (topicId: string, file: { name: string; size: number; type: string; url?: string; folderId?: string | null }): Promise<Material> => mockApi.uploadMaterial(topicId, file),
  getFolders: (topicId: string): Promise<Folder[]> => mockApi.getFolders(topicId),
  createFolder: (topicId: string, name: string, parentFolderId?: string | null): Promise<Folder> => mockApi.createFolder(topicId, name, parentFolderId),
  getDigitalNote: (topicId: string): Promise<DigitalNote | null> => mockApi.getDigitalNote(topicId),
  saveDigitalNote: (topicId: string, content: Record<string, unknown>, data?: { id?: string; title?: string; folderId?: string | null }): Promise<DigitalNote> => mockApi.saveDigitalNote(topicId, content, data),
  getDigitalNotes: (topicId: string): Promise<DigitalNote[]> => mockApi.getDigitalNotes(topicId),
  getWorkspaceSettings: (topicId: string): Promise<WorkspaceSettings | null> => mockApi.getWorkspaceSettings(topicId),
  saveWorkspaceSettings: (topicId: string, settings: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> => mockApi.saveWorkspaceSettings(topicId, settings),
};
