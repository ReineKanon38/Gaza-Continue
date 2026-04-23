import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

let mongo;
let adminToken;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);

  // Crear admin directamente en BD (password en plano para que el hook lo hashee una sola vez)
  await User.create({ name: 'Admin Prod', email: 'prodadmin@example.com', password: 'secret123', role: 'admin' });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'prodadmin@example.com',
    password: 'secret123'
  });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Product Flow', () => {
  it('rejects create product without token', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Widget', price: 10 });
    expect(res.status).toBe(401);
  });

  it('creates product with token', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Widget', price: 10, stock: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });
});
