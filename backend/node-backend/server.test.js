const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Setup Express app for testing
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/pomodoro', require('./routes/pomodoroRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ success: false, error: err.message });
});

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(60000);
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (e) {
      // ignore
    }
  }
});

describe('Auth & Security Integration Tests', () => {
  it('should register a new user successfully with root-level and nested token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'securePassword123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('token');
    expect(res.body.user.email).toEqual('student@example.com');
  });

  it('should fail registration with weak password or invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bad Student',
        email: 'invalid-email',
        password: '123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject excessively long password to prevent bcrypt CPU DoS', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Long PW Student',
        email: 'longpw@example.com',
        password: 'a'.repeat(200)
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user and return root-level token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('token');
  });
});

describe('Note CRUD & Authorization Isolation Tests', () => {
  let token1;
  let token2;
  let noteId;

  beforeEach(async () => {
    const user1Res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: 'user1@example.com', password: 'password123' });
    token1 = user1Res.body.token;

    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'user2@example.com', password: 'password123' });
    token2 = user2Res.body.token;

    const noteRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'User One Note', content: 'Secret content 1' });
    noteId = noteRes.body.note._id;
  });

  it('should allow owner to read their notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toEqual(1);
    expect(res.body.notes[0].title).toEqual('User One Note');
  });

  it('should prevent cross-user note access (User 2 trying to read User 1 note)', async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  it('should prevent cross-user note deletion', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);

    // Verify note still exists for owner
    const checkRes = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(checkRes.statusCode).toEqual(200);
  });

  it('should handle special regex characters in search without ReDoS or crash', async () => {
    const res = await request(app)
      .get('/api/notes?search=(((([a-z]+$')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes).toEqual([]);
  });
});

describe('BOLA / IDOR Protection Tests', () => {
  let token1;
  let token2;
  let user1SubjectId;

  beforeEach(async () => {
    const user1Res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: 'u1@example.com', password: 'password123' });
    token1 = user1Res.body.token;

    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'u2@example.com', password: 'password123' });
    token2 = user2Res.body.token;

    const subRes = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'User 1 Subject' });
    user1SubjectId = subRes.body.subject.id;
  });

  it('should prevent User 2 from creating a topic under User 1 subject', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        subjectId: user1SubjectId,
        title: 'Unauthorized Topic'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  it('should prevent User 2 from creating study folders under User 1 topic', async () => {
    // User 1 creates a valid topic
    const topicRes = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        subjectId: user1SubjectId,
        title: 'User 1 Topic'
      });
    const topicId = topicRes.body.topic.id;

    // User 2 tries to create folder under User 1 topic
    const folderRes = await request(app)
      .post('/api/study/folders')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        topicId,
        name: 'Malicious Folder'
      });

    expect(folderRes.statusCode).toEqual(404);
    expect(folderRes.body.success).toBe(false);
  });

  it('should prevent updating another user todo ID with 404 instead of crashing', async () => {
    // User 1 creates todo
    const todoRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'User 1 Task' });
    const todoId = todoRes.body.todo._id;

    // User 2 tries to update User 1's todo
    const updateRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token2}`)
      .send({ id: todoId, text: 'Hacked Task' });

    expect(updateRes.statusCode).toEqual(404);
    expect(updateRes.body.success).toBe(false);
  });
});
