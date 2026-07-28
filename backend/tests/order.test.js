import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

let mongo;
let userToken;
let adminToken;
let productId;
let orderId;
let bankOrderId;
let rejectedOrderId;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);

  // Crear usuario normal vía API
  await request(app).post('/api/auth/register').send({
    name: 'Order User',
    email: 'orderuser@example.com',
    password: 'secret123'
  });
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'orderuser@example.com',
    password: 'secret123'
  });
  userToken = userLogin.body.token;

  // Crear admin directamente en DB (password en plano para hash único por hook)
  await User.create({ name: 'Admin', email: 'admin@example.com', password: 'secret123', role: 'admin' });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'secret123'
  });
  adminToken = adminLogin.body.token;

  // Crear producto para orden
  const prodRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Order Product', price: 25, stock: 10 });
  productId = prodRes.body.data._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Order Flow', () => {
  it('creates order for user', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        products: [{ productId, quantity: 2 }],
        shippingAddress: {
          street: 'Street',
          number: '123',
          neighborhood: 'Center',
          city: 'CDMX',
          state: 'CDMX',
          zipCode: '01234'
        },
        paymentInfo: {
          method: 'credit_card',
          cardType: 'visa',
          cardLastFour: '4242'
        }
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
    orderId = res.body.data._id;
  });

  it('user cannot update order status', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'processing' });
    expect(res.status).toBe(403);
  });

  it('admin updates order status', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('processing');
  });

  it('cannot move bank transfer order to processing without payment approval', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        products: [{ productId, quantity: 1 }],
        shippingAddress: {
          street: 'Street',
          number: '456',
          neighborhood: 'Center',
          city: 'CDMX',
          state: 'CDMX',
          zipCode: '01234'
        },
        paymentInfo: {
          method: 'bank_transfer'
        }
      });

    expect(createRes.status).toBe(201);
    bankOrderId = createRes.body.data._id;
    expect(createRes.body.data.paymentStatus).toBe('pending_validation');

    const moveRes = await request(app)
      .put(`/api/orders/${bankOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' });

    expect(moveRes.status).toBe(409);
    expect(moveRes.body.message || moveRes.body.error).toContain('validacion de pago aprobada');
  });

  it('prevents approving payment twice for the same order', async () => {
    const firstApprove = await request(app)
      .put(`/api/orders/${bankOrderId}/payment/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reference: 'TRX-001' });

    expect(firstApprove.status).toBe(200);
    expect(firstApprove.body.data.paymentStatus).toBe('approved');
    expect(firstApprove.body.data.status).toBe('processing');

    const secondApprove = await request(app)
      .put(`/api/orders/${bankOrderId}/payment/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reference: 'TRX-002' });

    expect(secondApprove.status).toBe(409);
    expect(secondApprove.body.message || secondApprove.body.error).toContain('ya fue aprobado');
  });

  it('requires rejection reason and prevents rejecting payment twice', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        products: [{ productId, quantity: 1 }],
        shippingAddress: {
          street: 'Street',
          number: '789',
          neighborhood: 'Center',
          city: 'CDMX',
          state: 'CDMX',
          zipCode: '01234'
        },
        paymentInfo: {
          method: 'bank_transfer'
        }
      });

    expect(createRes.status).toBe(201);
    rejectedOrderId = createRes.body.data._id;

    const rejectWithoutReason = await request(app)
      .put(`/api/orders/${rejectedOrderId}/payment/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(rejectWithoutReason.status).toBe(400);

    const firstReject = await request(app)
      .put(`/api/orders/${rejectedOrderId}/payment/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'Comprobante no coincide con monto' });

    expect(firstReject.status).toBe(200);
    expect(firstReject.body.data.paymentStatus).toBe('rejected');
    expect(firstReject.body.data.status).toBe('cancelled');

    const secondReject = await request(app)
      .put(`/api/orders/${rejectedOrderId}/payment/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rejectionReason: 'Segundo intento' });

    expect(secondReject.status).toBe(409);
    expect(secondReject.body.message || secondReject.body.error).toContain('ya fue rechazado');
  });

  it('prevents race condition when two users purchase the last available stock simultaneously', async () => {
    // 1. Create a product with exactly stock = 1
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Race Condition Item', price: 99, stock: 1 });
    const singleStockProductId = prodRes.body.data._id;

    // 2. Dispatch two simultaneous order requests for the same product
    const orderPayload = {
      products: [{ productId: singleStockProductId, quantity: 1 }],
      shippingAddress: {
        street: 'Concurrent St',
        number: '100',
        neighborhood: 'Center',
        city: 'CDMX',
        state: 'CDMX',
        zipCode: '01234'
      },
      paymentInfo: {
        method: 'credit_card',
        cardType: 'visa',
        cardLastFour: '4242'
      }
    };

    const req1 = request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(orderPayload);

    const req2 = request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(orderPayload);

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one request must succeed (201) and the other fail (400)
    expect(statuses).toEqual([201, 400]);

    // 3. Confirm remaining stock is 0 (NOT negative)
    const checkProd = await request(app).get(`/api/products/${singleStockProductId}`);
    expect(checkProd.body.data.stock).toBe(0);
  });
});
