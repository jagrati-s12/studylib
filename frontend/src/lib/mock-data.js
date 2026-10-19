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
    return null;
  },
  async createSubject(data) {
    throw new Error('Backend required');
  },
  async updateSubject(id, data) {
    throw new Error('Backend required');
  },
  async deleteSubject(id) {
    throw new Error('Backend required');
  },
  async getAllTopics() {
    return [];
  },
  async getTopics(subjectId) {
    return [];
  },
  async getTopic(id) {
    return null;
  },
  async createTopic(subjectId, data) {
    throw new Error('Backend required');
  },
  async updateTopic(id, data) {
    throw new Error('Backend required');
  },
  async deleteTopic(id) {
    throw new Error('Backend required');
  },
  async getMaterials(topicId) {
    return [];
  },
  async uploadMaterial(topicId, file) {
    throw new Error('Backend required');
  },
  async getDigitalNote(topicId) {
    return null;
  },
  async getDigitalNotes(topicId) {
    return [];
  },
  async saveDigitalNote(topicId, content, data) {
    throw new Error('Backend required');
  },
  async getFolders(topicId) {
    return [];
  },
  async createFolder(topicId, name, parentFolderId = null) {
    throw new Error('Backend required');
  },
  async getWorkspaceSettings(topicId) {
    return null;
  },
  async saveWorkspaceSettings(topicId, settings) {
    throw new Error('Backend required');
  },
};
