// Mock data for development before the backend is connected

import type {
  Subject,
  Topic,
  Material,
  DigitalNote,
  WorkspaceSettings,
} from '@/types';

export const mockSubjects: Subject[] = [
  {
    id: 'sub-1',
    user_id: 'user-1',
    name: 'Data Mining',
    color: '#3b82f6',
    icon: 'Database',
    sort_order: 0,
    topic_count: 8,
    recent_topic: 'Classification Algorithms',
    updated_at: '2026-10-11T14:30:00Z',
  },
  {
    id: 'sub-2',
    user_id: 'user-1',
    name: 'Machine Learning',
    color: '#8b5cf6',
    icon: 'Brain',
    sort_order: 1,
    topic_count: 12,
    recent_topic: 'Neural Networks',
    updated_at: '2026-10-10T09:15:00Z',
  },
  {
    id: 'sub-3',
    user_id: 'user-1',
    name: 'Database Systems',
    color: '#22c55e',
    icon: 'Server',
    sort_order: 2,
    topic_count: 6,
    recent_topic: 'Query Optimization',
    updated_at: '2026-10-09T16:45:00Z',
  },
  {
    id: 'sub-4',
    user_id: 'user-1',
    name: 'Operating Systems',
    color: '#ef4444',
    icon: 'Monitor',
    sort_order: 3,
    topic_count: 10,
    recent_topic: 'Process Scheduling',
    updated_at: '2026-10-08T11:00:00Z',
  },
  {
    id: 'sub-5',
    user_id: 'user-1',
    name: 'Computer Networks',
    color: '#14b8a6',
    icon: 'Wifi',
    sort_order: 4,
    topic_count: 9,
    updated_at: '2026-10-07T13:20:00Z',
  },
];

export const mockTopics: Record<string, Topic[]> = {
  'sub-1': [
    {
      id: 'top-1',
      subject_id: 'sub-1',
      serial_number: 1,
      title: 'Search inspirations for upcoming project & KDD',
      sort_order: 0,
      material_count: 3,
      updated_at: '2026-10-11T14:30:00Z',
      status: 'todo',
      tags: ['#website', '#client', '#kdd'],
      progress: 40,
      note: 'They like our behance project Mise',
      checklist: [
        { id: 'c1', text: 'Review data preprocessing pipelines', completed: true },
        { id: 'c2', text: 'Annotate slides for KDD architecture', completed: false },
        { id: 'c3', text: 'Summarize pattern evaluation metrics', completed: false },
      ],
    },
    {
      id: 'top-2',
      subject_id: 'sub-1',
      serial_number: 2,
      title: 'Redesign grab website landing and login pages',
      sort_order: 1,
      material_count: 2,
      updated_at: '2026-10-10T12:00:00Z',
      status: 'in_review',
      tags: ['#website', '#client', '#regression'],
      progress: 75,
      note: 'We have a meeting 3:12 AM',
      checklist: [
        { id: 'c4', text: 'Check cost function convergence', completed: true },
        { id: 'c5', text: 'Gradient descent step size derivations', completed: true },
      ],
    },
    {
      id: 'top-3',
      subject_id: 'sub-1',
      serial_number: 3,
      title: 'Classification Algorithms & Heuristics',
      sort_order: 2,
      material_count: 4,
      updated_at: '2026-10-11T14:30:00Z',
      status: 'in_progress',
      tags: ['#dribbble shot', '#product', '#algorithms'],
      progress: 60,
      note: 'Review Gini impurity vs Information Gain',
      checklist: [
        { id: 'c6', text: 'Decision tree splits calculation', completed: true },
        { id: 'c7', text: 'Pruning criteria formulas', completed: false },
      ],
    },
    {
      id: 'top-4',
      subject_id: 'sub-1',
      serial_number: 4,
      title: 'Make user flow of akua mobile banking app',
      sort_order: 3,
      material_count: 1,
      updated_at: '2026-10-09T09:00:00Z',
      status: 'todo',
      tags: ['#mobileapp', '#client'],
      progress: 30,
      checklist: [
        { id: 'c8', text: 'Apriori candidate generation', completed: true },
        { id: 'c9', text: 'FP-Growth tree construction', completed: false },
      ],
    },
    {
      id: 'top-5',
      subject_id: 'sub-1',
      serial_number: 5,
      title: 'Natverk video platform web app design and develop',
      sort_order: 4,
      material_count: 2,
      updated_at: '2026-10-08T15:30:00Z',
      status: 'in_review',
      tags: ['#product', '#client', '#clustering'],
      progress: 85,
      note: 'Check K-means elbow criterion',
    },
    {
      id: 'top-6',
      subject_id: 'sub-1',
      serial_number: 6,
      title: 'Dimensionality Reduction (PCA & t-SNE)',
      sort_order: 5,
      material_count: 0,
      updated_at: '2026-10-07T10:00:00Z',
      status: 'todo',
      tags: ['#math', '#eigenvectors'],
      progress: 10,
    },
    {
      id: 'top-7',
      subject_id: 'sub-1',
      serial_number: 7,
      title: 'Design Moli app product page redesign',
      sort_order: 6,
      material_count: 1,
      updated_at: '2026-10-06T16:00:00Z',
      status: 'done',
      tags: ['#products', '#client'],
      progress: 100,
      checklist: [
        { id: 'c10', text: 'Tokenization and stopword filters', completed: true },
        { id: 'c11', text: 'TF-IDF matrix formulation', completed: true },
      ],
    },
    {
      id: 'top-8',
      subject_id: 'sub-1',
      serial_number: 8,
      title: 'Mining Data Streams & Reservoir Sampling',
      sort_order: 7,
      material_count: 0,
      updated_at: '2026-10-05T08:00:00Z',
      status: 'todo',
      tags: ['#streams', '#algorithms'],
      progress: 0,
    },
  ],
  'sub-2': [
    {
      id: 'top-9',
      subject_id: 'sub-2',
      serial_number: 1,
      title: 'Ginko mobile app design & ML workflow',
      sort_order: 0,
      material_count: 2,
      updated_at: '2026-10-10T09:15:00Z',
      status: 'todo',
      tags: ['#mobile app', '#client'],
      progress: 15,
      note: 'We have a meeting 2:34 AM',
      checklist: [
        { id: 'c12', text: 'Create user flow', completed: true },
        { id: 'c13', text: 'Make wireframe', completed: false },
        { id: 'c14', text: 'Design onboarding screens', completed: false },
        { id: 'c15', text: 'Make prototype', completed: false },
      ],
    },
    {
      id: 'top-10',
      subject_id: 'sub-2',
      serial_number: 2,
      title: 'Design CRM shop product page responsive website',
      sort_order: 1,
      material_count: 3,
      updated_at: '2026-10-09T14:00:00Z',
      status: 'in_progress',
      tags: ['#products', '#client', '#ml'],
      progress: 40,
      note: 'Cross-entropy loss function review',
    },
    {
      id: 'top-11',
      subject_id: 'sub-2',
      serial_number: 3,
      title: 'Wehiu product task and the task process pages',
      sort_order: 2,
      material_count: 5,
      updated_at: '2026-10-10T09:15:00Z',
      status: 'in_progress',
      tags: ['#dribbble shot', '#product'],
      progress: 90,
      note: 'Have to finish this before weekend',
      checklist: [
        { id: 'c16', text: 'Derive multi-layer perceptron backprop', completed: true },
        { id: 'c17', text: 'Weight decay and dropout regularizers', completed: true },
        { id: 'c18', text: 'Verify tensor shapes across layers', completed: false },
      ],
    },
  ],
  'sub-3': [
    {
      id: 'top-12',
      subject_id: 'sub-3',
      serial_number: 1,
      title: 'Orypto product landing page create in webflow',
      sort_order: 0,
      material_count: 3,
      updated_at: '2026-10-09T16:45:00Z',
      status: 'in_review',
      tags: ['#development', '#client', '#database'],
      progress: 80,
      checklist: [
        { id: 'c19', text: 'B+ Tree index depth check', completed: true },
        { id: 'c20', text: 'Cost-based query plan execution', completed: true },
      ],
    },
    {
      id: 'top-13',
      subject_id: 'sub-3',
      serial_number: 2,
      title: 'Create Odyah app prototype for Get notification in figma',
      sort_order: 1,
      material_count: 2,
      updated_at: '2026-10-08T11:00:00Z',
      status: 'in_review',
      tags: ['#mobileapp', '#client'],
      progress: 70,
    },
  ],
  'sub-4': [
    {
      id: 'top-14',
      subject_id: 'sub-4',
      serial_number: 1,
      title: 'Affitto product full service & Process Control',
      sort_order: 0,
      material_count: 4,
      updated_at: '2026-10-08T11:00:00Z',
      status: 'done',
      tags: ['#mobile app', '#client'],
      progress: 100,
      checklist: [
        { id: 'c21', text: 'Branding & process states', completed: true },
        { id: 'c22', text: 'Round robin scheduler trace', completed: true },
        { id: 'c23', text: 'Virtual memory paging tables', completed: true },
        { id: 'c24', text: 'Deadlock avoidance banker algorithm', completed: true },
        { id: 'c25', text: 'Final summary documentation', completed: true },
      ],
    },
  ],
};

export const mockMaterials: Record<string, Material[]> = {
  'top-1': [
    { id: 'mat-1', topic_id: 'top-1', material_type: 'pdf', title: 'Chapter 1 - Introduction.pdf', storage_key: 'users/user-1/sub-1/top-1/mat-1.pdf', mime_type: 'application/pdf', file_size_bytes: 2_400_000, page_count: 24, created_at: '2026-10-05T10:00:00Z', updated_at: '2026-10-05T10:00:00Z' },
    { id: 'mat-2', topic_id: 'top-1', material_type: 'handwritten_image', title: 'Lecture Notes - Page 1.jpg', storage_key: 'users/user-1/sub-1/top-1/mat-2.jpg', mime_type: 'image/jpeg', file_size_bytes: 800_000, page_count: null, created_at: '2026-10-06T08:30:00Z', updated_at: '2026-10-06T08:30:00Z' },
    { id: 'mat-3', topic_id: 'top-1', material_type: 'pdf', title: 'Reference Paper.pdf', storage_key: 'users/user-1/sub-1/top-1/mat-3.pdf', mime_type: 'application/pdf', file_size_bytes: 5_100_000, page_count: 42, created_at: '2026-10-07T14:00:00Z', updated_at: '2026-10-07T14:00:00Z' },
  ],
  'top-3': [
    { id: 'mat-4', topic_id: 'top-3', material_type: 'pdf', title: 'Classification Slides.pdf', storage_key: 'users/user-1/sub-1/top-3/mat-4.pdf', mime_type: 'application/pdf', file_size_bytes: 3_200_000, page_count: 36, created_at: '2026-10-08T10:00:00Z', updated_at: '2026-10-08T10:00:00Z' },
    { id: 'mat-5', topic_id: 'top-3', material_type: 'handwritten_image', title: 'Decision Tree Notes.png', storage_key: 'users/user-1/sub-1/top-3/mat-5.png', mime_type: 'image/png', file_size_bytes: 1_200_000, page_count: null, created_at: '2026-10-09T09:00:00Z', updated_at: '2026-10-09T09:00:00Z' },
  ],
};

export const mockDigitalNotes: Record<string, DigitalNote> = {
  'top-1': {
    id: 'note-1',
    topic_id: 'top-1',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction to Data Mining' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Data mining is the process of discovering patterns in large datasets. Key concepts:' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Knowledge Discovery in Databases (KDD)' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Data preprocessing and cleaning' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pattern evaluation and presentation' }] }] },
        ]},
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Key Algorithms' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'The main categories of data mining tasks include classification, clustering, regression, and association rule mining.' }] },
      ],
    },
    updated_at: '2026-10-11T14:30:00Z',
  },
};

export const mockWorkspaceSettings: Record<string, WorkspaceSettings> = {
  'top-1': {
    id: 'ws-1',
    user_id: 'user-1',
    topic_id: 'top-1',
    layout: 'split',
    left_material_id: 'mat-1',
    right_material_id: null, // digital notes
    left_page: 1,
    right_page: 1,
    left_zoom: 100,
    right_zoom: 100,
    preferences: {},
  },
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    await delay(300);
    return [...mockSubjects];
  },

  async createSubject(data: { name: string; color: string }): Promise<Subject> {
    await delay(300);
    const subject: Subject = {
      id: `sub-${Date.now()}`,
      user_id: 'user-1',
      name: data.name,
      color: data.color,
      sort_order: mockSubjects.length,
      topic_count: 0,
      updated_at: new Date().toISOString(),
    };
    mockSubjects.push(subject);
    return subject;
  },

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    await delay(200);
    const idx = mockSubjects.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Subject not found');
    mockSubjects[idx] = { ...mockSubjects[idx], ...data };
    return mockSubjects[idx];
  },

  async deleteSubject(id: string): Promise<void> {
    await delay(300);
    const idx = mockSubjects.findIndex(s => s.id === id);
    if (idx !== -1) mockSubjects.splice(idx, 1);
  },

  // Topics
  async getAllTopics(): Promise<Topic[]> {
    await delay(200);
    const all: Topic[] = [];
    for (const list of Object.values(mockTopics)) {
      all.push(...list);
    }
    return all;
  },

  async getTopics(subjectId: string): Promise<Topic[]> {
    await delay(300);
    return mockTopics[subjectId] ?? [];
  },

  async createTopic(
    subjectId: string,
    data: {
      serial_number: number;
      title: string;
      status?: Topic['status'];
      tags?: string[];
      checklist?: Topic['checklist'];
      note?: string;
    }
  ): Promise<Topic> {
    await delay(300);
    const topics = mockTopics[subjectId] ?? [];
    const topic: Topic = {
      id: `top-${Date.now()}`,
      subject_id: subjectId,
      serial_number: data.serial_number,
      title: data.title,
      sort_order: topics.length,
      material_count: 0,
      updated_at: new Date().toISOString(),
      status: data.status ?? 'todo',
      tags: data.tags ?? ['#study'],
      progress: data.status === 'done' ? 100 : 0,
      checklist: data.checklist ?? [],
      note: data.note,
    };
    if (!mockTopics[subjectId]) mockTopics[subjectId] = [];
    mockTopics[subjectId].push(topic);
    return topic;
  },

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    await delay(150);
    for (const key of Object.keys(mockTopics)) {
      const idx = mockTopics[key].findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTopics[key][idx] = {
          ...mockTopics[key][idx],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return mockTopics[key][idx];
      }
    }
    throw new Error('Topic not found');
  },

  async deleteTopic(id: string): Promise<void> {
    await delay(300);
    for (const key of Object.keys(mockTopics)) {
      const idx = mockTopics[key].findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTopics[key].splice(idx, 1);
        break;
      }
    }
  },

  // Materials
  async getMaterials(topicId: string): Promise<Material[]> {
    await delay(200);
    return mockMaterials[topicId] ?? [];
  },

  async uploadMaterial(topicId: string, file: { name: string; size: number; type: string }): Promise<Material> {
    await delay(300);
    const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const newMaterial: Material = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      topic_id: topicId,
      material_type: isPdf ? 'pdf' : 'handwritten_image',
      title: file.name,
      storage_key: `users/user-1/topics/${topicId}/${file.name}`,
      mime_type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
      file_size_bytes: file.size,
      page_count: isPdf ? 1 : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!mockMaterials[topicId]) {
      mockMaterials[topicId] = [];
    }
    mockMaterials[topicId].push(newMaterial);
    return newMaterial;
  },

  // Digital notes
  async getDigitalNote(topicId: string): Promise<DigitalNote | null> {
    await delay(200);
    return mockDigitalNotes[topicId] ?? null;
  },

  async saveDigitalNote(topicId: string, content: Record<string, unknown>): Promise<DigitalNote> {
    await delay(300);
    const note: DigitalNote = {
      id: mockDigitalNotes[topicId]?.id ?? `note-${Date.now()}`,
      topic_id: topicId,
      content,
      updated_at: new Date().toISOString(),
    };
    mockDigitalNotes[topicId] = note;
    return note;
  },

  // Workspace
  async getWorkspaceSettings(topicId: string): Promise<WorkspaceSettings | null> {
    await delay(100);
    return mockWorkspaceSettings[topicId] ?? null;
  },

  async saveWorkspaceSettings(topicId: string, settings: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    await delay(100);
    const existing = mockWorkspaceSettings[topicId];
    const defaultSettings: WorkspaceSettings = {
      id: `ws-${Date.now()}`,
      user_id: 'user-1',
      topic_id: topicId,
      layout: 'single',
      left_material_id: null,
      right_material_id: null,
      left_page: 1,
      right_page: 1,
      left_zoom: 100,
      right_zoom: 100,
      preferences: {},
    };
    const ws: WorkspaceSettings = {
      ...defaultSettings,
      ...existing,
      ...settings,
    };
    mockWorkspaceSettings[topicId] = ws;
    return ws;
  },

  // Get a single subject
  async getSubject(id: string): Promise<Subject | undefined> {
    await delay(100);
    return mockSubjects.find(s => s.id === id);
  },

  // Get a single topic
  async getTopic(id: string): Promise<Topic | undefined> {
    await delay(100);
    for (const topics of Object.values(mockTopics)) {
      const found = topics.find(t => t.id === id);
      if (found) return found;
    }
    return undefined;
  },
};
