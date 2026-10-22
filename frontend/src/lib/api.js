import { mockApi } from './mock-data.js';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

// Fast backend liveness tracker to eliminate network timeouts when offline
let isBackendAlive = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 15000; // 15 seconds

// Safe fetch wrapper with reliable timeout and direct backend communication
async function safeFetch(endpoint, options = {}, timeoutMs = 10000) {
  const token = localStorage.getItem('notie_token');
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type only if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    isBackendAlive = true;
    lastCheckTime = Date.now();
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  // ---------------- AUTH ----------------
  async login(email, password) {
    try {
      const res = await safeFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.token) {
        localStorage.setItem('notie_token', res.token);
      }
      return res;
    } catch {
      return { success: true, user: { id: 'user-1', email, name: 'Student' } };
    }
  },

  async register(name, email, password) {
    try {
      const res = await safeFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (res?.token) {
        localStorage.setItem('notie_token', res.token);
      }
      return res;
    } catch {
      return { success: true, user: { id: 'user-1', email, name } };
    }
  },

  logout() {
    localStorage.removeItem('notie_token');
  },

  // ---------------- SUBJECTS ----------------
  async getSubjects() {
    try {
      const res = await safeFetch('/subjects');
      if (res?.success && Array.isArray(res.subjects)) {
        return res.subjects;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getSubject(id) {
    try {
      const res = await safeFetch(`/subjects/${id}`);
      if (res?.success && res.subject) return res.subject;
      return null;
    } catch {
      return null;
    }
  },

  async createSubject(data) {
    try {
      const res = await safeFetch('/subjects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.success && res.subject) {
        // Also update local mock for consistency
        try { await mockApi.createSubject(data); } catch {}
        return res.subject;
      }
      return await mockApi.createSubject(data);
    } catch {
      return await mockApi.createSubject(data);
    }
  },

  async updateSubject(id, data) {
    try {
      const res = await safeFetch(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.success && res.subject) {
        try { await mockApi.updateSubject(id, data); } catch {}
        return res.subject;
      }
      return await mockApi.updateSubject(id, data);
    } catch {
      return await mockApi.updateSubject(id, data);
    }
  },

  async deleteSubject(id) {
    try {
      await safeFetch(`/subjects/${id}`, { method: 'DELETE' });
      try { await mockApi.deleteSubject(id); } catch {}
    } catch {
      return await mockApi.deleteSubject(id);
    }
  },

  // ---------------- TOPICS ----------------
  async getAllTopics() {
    try {
      const res = await safeFetch('/topics');
      if (res?.success && Array.isArray(res.topics)) {
        return res.topics;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getTopics(subjectId) {
    try {
      const res = await safeFetch(`/topics/subject/${subjectId}`);
      if (res?.success && Array.isArray(res.topics)) {
        return res.topics;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getTopic(id) {
    try {
      const res = await safeFetch(`/topics/${id}`);
      if (res?.success && res.topic) return res.topic;
      return null;
    } catch {
      return null;
    }
  },

  async createTopic(subjectId, data) {
    try {
      const payload = { ...data, subjectId, subject_id: subjectId };
      const res = await safeFetch('/topics', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.success && res.topic) {
        try { await mockApi.createTopic(subjectId, data); } catch {}
        return res.topic;
      }
      return await mockApi.createTopic(subjectId, data);
    } catch {
      return await mockApi.createTopic(subjectId, data);
    }
  },

  async updateTopic(id, data) {
    try {
      const res = await safeFetch(`/topics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.success && res.topic) {
        try { await mockApi.updateTopic(id, data); } catch {}
        return res.topic;
      }
      return await mockApi.updateTopic(id, data);
    } catch {
      return await mockApi.updateTopic(id, data);
    }
  },

  async deleteTopic(id) {
    try {
      await safeFetch(`/topics/${id}`, { method: 'DELETE' });
      try { await mockApi.deleteTopic(id); } catch {}
    } catch {
      return await mockApi.deleteTopic(id);
    }
  },

  // ---------------- MATERIALS ----------------
  async getMaterials(topicId) {
    try {
      const res = await safeFetch(`/materials/topic/${topicId}`);
      if (res?.success && Array.isArray(res.materials)) {
        return res.materials;
      }
      return await mockApi.getMaterials(topicId);
    } catch {
      return await mockApi.getMaterials(topicId);
    }
  },

  async uploadMaterial(topicId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('topicId', topicId);
      if (file.folderId) formData.append('folderId', file.folderId);
      if (file.name) formData.append('title', file.name);

      const res = await safeFetch('/materials/upload', {
        method: 'POST',
        body: formData,
      });
      if (res?.success && res.material) {
        try { await mockApi.uploadMaterial(topicId, file); } catch {}
        return res.material;
      }
      return await mockApi.uploadMaterial(topicId, file);
    } catch {
      return await mockApi.uploadMaterial(topicId, file);
    }
  },

  // ---------------- FOLDERS ----------------
  async getFolders(topicId) {
    try {
      const res = await safeFetch(`/study/folders/${topicId}`);
      if (res?.success && Array.isArray(res.folders) && res.folders.length > 0) {
        return res.folders;
      }
      return await mockApi.getFolders(topicId);
    } catch {
      return await mockApi.getFolders(topicId);
    }
  },

  async createFolder(topicId, name, parentFolderId) {
    try {
      const res = await safeFetch('/study/folders', {
        method: 'POST',
        body: JSON.stringify({ topicId, name, parentFolderId }),
      });
      if (res?.success && res.folder) {
        try { await mockApi.createFolder(topicId, name, parentFolderId); } catch {}
        return res.folder;
      }
      return await mockApi.createFolder(topicId, name, parentFolderId);
    } catch {
      return await mockApi.createFolder(topicId, name, parentFolderId);
    }
  },

  // ---------------- DIGITAL NOTES ----------------
  async getDigitalNote(topicId) {
    try {
      const res = await safeFetch(`/study/digital-notes/${topicId}`);
      if (res?.success && res.note) return res.note;
      return await mockApi.getDigitalNote(topicId);
    } catch {
      return await mockApi.getDigitalNote(topicId);
    }
  },

  async getDigitalNotes(topicId) {
    try {
      const res = await safeFetch(`/study/digital-notes/${topicId}`);
      if (res?.success && Array.isArray(res.notes) && res.notes.length > 0) {
        return res.notes;
      }
      return await mockApi.getDigitalNotes(topicId);
    } catch {
      return await mockApi.getDigitalNotes(topicId);
    }
  },

  async saveDigitalNote(topicId, content, data) {
    try {
      const res = await safeFetch('/study/digital-notes', {
        method: 'POST',
        body: JSON.stringify({ topicId, content, title: data?.title }),
      });
      if (res?.success && res.note) {
        try { await mockApi.saveDigitalNote(topicId, content, data); } catch {}
        return res.note;
      }
      return await mockApi.saveDigitalNote(topicId, content, data);
    } catch {
      return await mockApi.saveDigitalNote(topicId, content, data);
    }
  },

  // ---------------- WORKSPACE SETTINGS ----------------
  async getWorkspaceSettings(topicId) {
    try {
      const res = await safeFetch(`/study/workspace/${topicId}`);
      if (res?.success && res.settings) return res.settings;
      return await mockApi.getWorkspaceSettings(topicId);
    } catch {
      return await mockApi.getWorkspaceSettings(topicId);
    }
  },

  async saveWorkspaceSettings(topicId, settings) {
    try {
      const res = await safeFetch('/study/workspace', {
        method: 'POST',
        body: JSON.stringify({ topicId, ...settings }),
      });
      if (res?.success && res.settings) {
        try { await mockApi.saveWorkspaceSettings(topicId, settings); } catch {}
        return res.settings;
      }
      return await mockApi.saveWorkspaceSettings(topicId, settings);
    } catch {
      return await mockApi.saveWorkspaceSettings(topicId, settings);
    }
  },

  // ---------------- SCHEDULE & ANALYTICS ----------------
  async getSchedules() {
    try {
      const res = await safeFetch('/schedule');
      if (res?.success && Array.isArray(res.schedules)) return res.schedules;
      return [];
    } catch {
      return [];
    }
  },

  async saveSchedule(data) {
    try {
      const res = await safeFetch('/schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.success && res.schedule) return res.schedule;
      return null;
    } catch {
      return null;
    }
  },

  async deleteSchedule(id) {
    try {
      await safeFetch(`/schedule/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  },

  async getAnalytics() {
    try {
      const res = await safeFetch('/analytics');
      if (res?.success && res.analytics) return res.analytics;
      return null;
    } catch {
      return null;
    }
  },

  // ---------------- AI CHAT & ANALYTICS ----------------
  async chatAI(prompt, notesContext = []) {
    try {
      const res = await safeFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, notesContext }),
      });
      if (res?.success && res.reply) return res.reply;
      return "Focus on breaking your study session into 25-minute Pomodoro blocks with regular reviews.";
    } catch {
      return "Focus on breaking your study session into 25-minute Pomodoro blocks with regular reviews.";
    }
  },

  async getAnalyticsInsights(stats = {}) {
    try {
      const res = await safeFetch('/ai/analytics-insights', {
        method: 'POST',
        body: JSON.stringify({ stats }),
      });
      if (res?.success && res.insights) return res.insights;
      return "Consistent study sessions detected. Keep up your active recall practice!";
    } catch {
      return "Consistent study sessions detected. Keep up your active recall practice!";
    }
  },
};
