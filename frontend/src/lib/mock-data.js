// Mock data removed. The app connects directly to MongoDB via the Node.js Express backend and Python AI microservice.

export const mockSubjects = [];
export const mockTopics = {};
export const mockMaterials = {};
export const mockDigitalNotes = {};
export const mockWorkspaceSettings = {};
export const mockFolders = {};

export const mockApi = {
  async getSubjects() {
    return [];
  },
  async getSubject(id) {
    return { id, name: 'Sample Subject', color: '#3b82f6', icon: 'BookOpen' };
  },
  async createSubject(data) {
    return { id: 'subj-' + Date.now(), name: data.name || 'New Subject', color: data.color || '#3b82f6', icon: data.icon || 'BookOpen', created_at: new Date().toISOString() };
  },
  async updateSubject(id, data) {
    return { id, ...data, updated_at: new Date().toISOString() };
  },
  async deleteSubject(id) {
    return { success: true };
  },
  async getAllTopics() {
    return [];
  },
  async getTopics(subjectId) {
    return [];
  },
  async getTopic(id) {
    return { id, title: 'Sample Topic', status: 'todo', progress: 0 };
  },
  async createTopic(subjectId, data) {
    return { id: 'topic-' + Date.now(), subjectId, title: data.title || 'New Topic', status: 'todo', progress: 0, created_at: new Date().toISOString() };
  },
  async updateTopic(id, data) {
    return { id, ...data, updated_at: new Date().toISOString() };
  },
  async deleteTopic(id) {
    return { success: true };
  },
  async getMaterials(topicId) {
    return [];
  },
  async uploadMaterial(topicId, file) {
    return { id: 'mat-' + Date.now(), topicId, title: file?.name || 'Uploaded File', url: '#', materialType: 'other', created_at: new Date().toISOString() };
  },
  async getDigitalNote(topicId) {
    return null;
  },
  async getDigitalNotes(topicId) {
    return [];
  },
  async saveDigitalNote(topicId, content, data) {
    return { success: true, topicId, content };
  },
  async getFolders(topicId) {
    return [];
  },
  async createFolder(topicId, name, parentFolderId = null) {
    return { id: 'folder-' + Date.now(), topicId, name, parentFolderId };
  },
  async getWorkspaceSettings(topicId) {
    return null;
  },
  async saveWorkspaceSettings(topicId, settings) {
    return { success: true, settings };
  },
  async getAnalytics() {
    return {
      weeklyHours: 12.5,
      streakDays: 7,
      avgConfidence: 4.3,
      completionRate: 82,
      totalSessions: 0,
      totalStudyMinutes: 0,
      subjectsCount: 0,
      topicsCount: 0
    };
  },
};
