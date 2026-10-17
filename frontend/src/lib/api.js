import { mockApi } from './mock-data';


export const api = {
  getSubjects: () => mockApi.getSubjects(),
  getSubject: (id) => mockApi.getSubject(id),
  createSubject: (data) => mockApi.createSubject(data),
  updateSubject: (id, data) => mockApi.updateSubject(id, data),
  deleteSubject: (id) => mockApi.deleteSubject(id),
  getAllTopics: () => mockApi.getAllTopics(),
  getTopics: (subjectId) => mockApi.getTopics(subjectId),
  getTopic: (id) => mockApi.getTopic(id),
  createTopic: (subjectId, data) => mockApi.createTopic(subjectId, data),
  updateTopic: (id, data) => mockApi.updateTopic(id, data),
  deleteTopic: (id) => mockApi.deleteTopic(id),
  getMaterials: (topicId) => mockApi.getMaterials(topicId),
  uploadMaterial: (topicId, file) => mockApi.uploadMaterial(topicId, file),
  getFolders: (topicId) => mockApi.getFolders(topicId),
  createFolder: (topicId, name, parentFolderId) => mockApi.createFolder(topicId, name, parentFolderId),
  getDigitalNote: (topicId) => mockApi.getDigitalNote(topicId),
  saveDigitalNote: (topicId, content, data) => mockApi.saveDigitalNote(topicId, content, data),
  getDigitalNotes: (topicId) => mockApi.getDigitalNotes(topicId),
  getWorkspaceSettings: (topicId) => mockApi.getWorkspaceSettings(topicId),
  saveWorkspaceSettings: (topicId, settings) => mockApi.saveWorkspaceSettings(topicId, settings),
};
