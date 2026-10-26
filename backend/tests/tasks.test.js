// Automated API tests (Jest + Supertest) – no real MongoDB needed.
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('../models/tasks');
const Task = require('../models/tasks');
const { cache } = require('../taskCache');
const app = require('../server');

const USER_ID = '507f1f77bcf86cd799439011';
const token = jwt.sign({ userId: USER_ID, email: 'user@test.com', role: 'user' }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

const setDbState = (state) =>
  Object.defineProperty(mongoose.connection, 'readyState', { get: () => state, configurable: true });

beforeEach(() => {
  cache.flushAll();
  setDbState(1); // pretend MongoDB is connected
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('Task Manager API', () => {
  test('GET /tasks returns 200', async () => {
    Task.find.mockReturnValue({
      sort: () => ({ lean: async () => [{ _id: 't1', title: 'Write tests', status: 'pending' }] }),
    });
    const res = await request(app).get('/tasks').set(auth);
    expect(res.statusCode).toBe(200); // CI-DEMO
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  // Second test, different endpoint (post-lab assignment)
  test('GET /tasks/:id with an invalid id returns 400', async () => {
    const res = await request(app).get('/tasks/not-an-id').set(auth);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid task ID format');
  });

  test('GET /tasks without a token returns 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
  });

  test('GET /tasks returns 503 when the database is down', async () => {
    setDbState(0);
    const res = await request(app).get('/tasks').set(auth);
    expect(res.statusCode).toBe(503);
  });

  test('GET /admin/report without a token returns 401', async () => {
    const res = await request(app).get('/admin/report');
    expect(res.statusCode).toBe(401);
  });

  test('POST /auth/register rejects an invalid email', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'bad', password: '123456' });
    expect(res.statusCode).toBe(400);
  });

  test('POST with a non-JSON content type returns 400', async () => {
    const res = await request(app).post('/tasks').set(auth).set('Content-Type', 'text/plain').send('hello');
    expect(res.statusCode).toBe(400);
  });

  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});
