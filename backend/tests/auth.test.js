import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

let mongo;
let adminToken;
let managedUserId;
let managedUserToken;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);

  await User.create({
    name: 'Admin User',
    email: 'admin-auth@example.com',
    password: 'secret123',
    role: 'admin'
  });

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin-auth@example.com',
    password: 'secret123'
  });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth Flow', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret123'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('fails duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User2',
      email: 'test@example.com',
      password: 'secret123'
    });
    expect(res.status).toBe(409);
  });



  it('logs in user and returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'secret123'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'user');
    managedUserId = res.body.user._id;
    managedUserToken = res.body.token;
  });

  it('fails to verify 2FA with invalid token', async () => {
    const res = await request(app).post('/api/auth/2fa/verify').set('Authorization', `Bearer ${managedUserToken}`).send({
      token: '000000'
    });
    expect(res.status).toBe(400);
  });

  it('2FA Login Flow - step 1 returns preAuthToken', async () => {
    const user = await User.findById(managedUserId);
    user.twoFactorEnabled = true;
    user.twoFactorSecret = 'JBSWY3DPEHPK3PXP'; // Base32 mock secret
    await user.save();

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'secret123'
    });

    expect(res.status).toBe(202);
    expect(res.body.requires2fa).toBe(true);
    expect(res.body.preAuthToken).toBeDefined();
    
    user.twoFactorEnabled = false;
    await user.save();
  });

  it('stats endpoints are admin-only', async () => {
    const userRes = await request(app)
      .get('/api/stats/dashboard')
      .set('Authorization', `Bearer ${managedUserToken}`);
    expect(userRes.status).toBe(403);

    const adminRes = await request(app)
      .get('/api/stats/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
  });

  it('admin can get and update system config', async () => {
    const getRes = await request(app)
      .get('/api/config')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data).toHaveProperty('paymentMethods');

    const paymentRes = await request(app)
      .put('/api/config/payment-methods')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bankTransfer: true, cash: true, creditCard: false });

    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.data.paymentMethods.cash).toBe(true);

    const shippingRes = await request(app)
      .put('/api/config/shipping-methods')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        shippingMethods: [
          {
            code: 'standard',
            name: 'Envio estandar',
            enabled: true,
            cost: 99,
            estimatedDays: '2-5 dias habiles'
          }
        ]
      });

    expect(shippingRes.status).toBe(200);
    expect(shippingRes.body.data.shippingMethods[0].cost).toBe(99);
  });

  it('admin can list users', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('admin can update user role', async () => {
    const res = await request(app)
      .put(`/api/auth/users/${managedUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('admin');

    const revertRes = await request(app)
      .put(`/api/auth/users/${managedUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' });

    expect(revertRes.status).toBe(200);
    expect(revertRes.body.data.role).toBe('user');
  });

  it('admin can block and unblock user', async () => {
    const blockRes = await request(app)
      .put(`/api/auth/users/${managedUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isBlocked: true });

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.data.isBlocked).toBe(true);

    const blockedLogin = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'secret123'
    });
    expect(blockedLogin.status).toBe(403);

    const unblockRes = await request(app)
      .put(`/api/auth/users/${managedUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isBlocked: false });

    expect(unblockRes.status).toBe(200);
    expect(unblockRes.body.data.isBlocked).toBe(false);
  });
});
