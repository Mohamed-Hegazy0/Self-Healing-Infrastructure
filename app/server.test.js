const request = require('supertest');
const app = require('./server');

describe('Self-Healing App', () => {
  test('GET /health returns healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/status returns running status', async () => {
    const response = await request(app).get('/api/status');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('running');
  });

  test('GET /api/data returns data array', async () => {
    const response = await request(app).get('/api/data');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBe(10);
  });

  test('GET /metrics returns prometheus metrics', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
  });

  test('GET /nonexistent returns 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});
