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
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'securePassword123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
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

  it('should login an existing user', async () => {
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
    token1 = user1Res.body.user.token;

    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: 'user2@example.com', password: 'password123' });
    token2 = user2Res.body.user.token;

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
});
