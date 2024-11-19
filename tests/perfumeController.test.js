const request = require('supertest');
const mongoose = require('mongoose');
const { startServer } = require('../server');

const testPerfume = {
  name: 'Chanel No. 5',
  brand: 'Chanel',
  fragranceNotes: ['Jasmine', 'Rose', 'Sandalwood'],
  volume: 50,
  price: 120.99,
  createdAt: new Date(),
};

describe('Perfume API', () => {
  let server;

  beforeAll(() => {
    server = startServer(5001);
  });

  afterAll((done) => {
    server.close(done);
    mongoose.disconnect();
  });

  it('fetch all perfumes', async () => {
    const response = await request(server).get('/api/perfumes');
    expect(response.status).toBe(200);
  });

  it('adding perfume', async () => {
    const response = await request(server)
      .post('/api/perfumes')
      .send(testPerfume)
      .expect(201);
    expect(response.body.name).toBe('Chanel No. 5');
    expect(response.body.brand).toBe('Chanel');
    expect(response.body.fragranceNotes).toEqual(['Jasmine', 'Rose', 'Sandalwood']);
    expect(response.body.volume).toBe(50);
    expect(response.body.price).toBe(120.99);
    expect(response.body.createdAt).toBeDefined();
  });
});
