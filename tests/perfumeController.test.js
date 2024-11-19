const request = require('supertest');
const mongoose = require('mongoose');
const { startServer } = require('../server');

describe('Perfume API', () => {
  let server;

  beforeAll(() => {
    server = startServer(5001);
  });

  afterAll((done) => {
    server.close(done);
    mongoose.disconnect();
  });

  it('should fetch all perfumes', async () => {
    const response = await request(server).get('/api/perfumes');
    expect(response.status).toBe(200);
  });
});
