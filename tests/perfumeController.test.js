const request = require('supertest');
const mongoose = require('mongoose');
const { startServer } = require('../server');

const Perfume = require('../models/perfumeModel');

const testPerfume = {
  name: 'Chanel No. 5',
  brand: 'Chanel',
  fragranceNotes: ['jasmine', 'rose', 'sandalwood'],
  volume: 50,
  price: 120.99,
  createdAt: new Date(),
};

const testPerfume2 = {
  name: 'Chanel No. 19',
  brand: 'Chanel',
  fragranceNotes: ['rose', 'vetiver'],
  volume: 50,
  price: 120.99,
  createdAt: new Date(),
};

describe('Perfume API', () => {
  let server;

  beforeAll(() => {
    server = startServer(5001);
  });

  afterEach(async () => {
    await Perfume.deleteMany({});
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
    expect(response.body.fragranceNotes).toEqual(['jasmine', 'rose', 'sandalwood']);
    expect(response.body.volume).toBe(50);
    expect(response.body.price).toBe(120.99);
    expect(response.body.createdAt).toBeDefined();
  });

  test('delete perfume by name and return deleted count', async () => {
    await request(server)
      .post('/api/perfumes')
      .send(testPerfume);

    const response = await request(server)
      .delete('/api/perfumes')
      .send({ name: 'Chanel No. 5' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Perfume(s) deleted successfully',
      deletedCount: 1,
    });
  });

  test('should return 404 if no perfumes are found with the given name', async () => {
    const response = await request(server)
      .delete('/api/perfumes')
      .send({ name: 'Nonexistent Perfume' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No perfumes found with that name",
    });
  });

  test('should return perfumes matching the given notes', async () => {
    await request(server)
      .post('/api/perfumes')
      .send(testPerfume);

    await request(server)
      .post('/api/perfumes')
      .send(testPerfume2);

    const response = await request(server)
      .post('/api/perfumes/findByNotes')
      .send({ notes: ['rose'] });

    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'Chanel No. 5 by Chanel',
      'Chanel No. 19 by Chanel',
    ]);
  });

  test('find a common note', async () => {
    await request(server)
      .post('/api/perfumes')
      .send(testPerfume);

    await request(server)
      .post('/api/perfumes')
      .send(testPerfume2);

    const response = await request(server)
      .post('/api/perfumes/compare')
      .send({
        perfume1: testPerfume,
        perfume2: testPerfume2,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual([
      'rose',
    ]);
  });

  test('should scrape a perfume and save it to the database', async () => {
    const response = await request(server)
      .post('/api/perfumes/scrape')
      .send({ url: 'https://www.fragrantica.com/perfume/Zara/Ebony-Wood-58157.html' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Perfume scraped and added successfully');

    const { perfume } = response.body;

    expect(perfume).toHaveProperty('name', 'Ebony Wood');
    expect(perfume).toHaveProperty('brand', 'Zara');
    expect(perfume).toHaveProperty('fragranceNotes');
    expect(Array.isArray(perfume.fragranceNotes)).toBe(true);
    expect(perfume).toHaveProperty('_id');
    expect(perfume).toHaveProperty('createdAt');
    expect(perfume).toHaveProperty('__v', 0);
  }, 20000);
});
