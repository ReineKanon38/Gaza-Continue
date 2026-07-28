import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed'
    },
    payloadSummary: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('WebhookLog', webhookLogSchema);
