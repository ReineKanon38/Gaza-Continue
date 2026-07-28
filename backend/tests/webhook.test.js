import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import WebhookLog from '../src/models/WebhookLog.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Stripe Webhook Idempotency', () => {
  it('processes a webhook event and ignores duplicate requests', async () => {
    const eventPayload = {
      id: 'evt_test_idempotency_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId: 'N/A' }
        }
      }
    };

    // First request should process successfully (200 OK)
    const res1 = await request(app)
      .post('/api/payment/webhook')
      .send(eventPayload);

    expect(res1.status).toBe(200);
    expect(res1.body).toHaveProperty('received', true);
    expect(res1.body.idempotent).toBeUndefined();

    // Verify event was saved to WebhookLog collection
    const logDoc = await WebhookLog.findOne({ eventId: 'evt_test_idempotency_123' });
    expect(logDoc).not.toBeNull();
    expect(logDoc.eventType).toBe('payment_intent.succeeded');

    // Second request with exact same event.id should be caught by idempotency check
    const res2 = await request(app)
      .post('/api/payment/webhook')
      .send(eventPayload);

    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ received: true, idempotent: true });

    // Verify only ONE entry exists in WebhookLog
    const logCount = await WebhookLog.countDocuments({ eventId: 'evt_test_idempotency_123' });
    expect(logCount).toBe(1);
  });
});
