import mongoose from 'mongoose';

const endpointSnapshotSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  success: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  cacheHit: { type: Number, default: 0 },
  staleCacheHit: { type: Number, default: 0 },
  avgLatencyMs: { type: Number, default: 0 },
  lastLatencyMs: { type: Number, default: 0 },
  lastError: { type: String, default: null },
  lastSeenAt: { type: String, default: null }
}, { _id: false });

const syscomHealthSnapshotSchema = new mongoose.Schema({
  capturedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  uptimeStartedAt: {
    type: String,
    default: null
  },
  cacheTtlMs: {
    type: Number,
    default: 0
  },
  cacheEntries: {
    type: Number,
    default: 0
  },
  endpoints: {
    search: { type: endpointSnapshotSchema, default: () => ({}) },
    superPrecio: { type: endpointSnapshotSchema, default: () => ({}) },
    categories: { type: endpointSnapshotSchema, default: () => ({}) },
    brands: { type: endpointSnapshotSchema, default: () => ({}) },
    tags: { type: endpointSnapshotSchema, default: () => ({}) }
  }
}, {
  timestamps: true
});

export default mongoose.model('SyscomHealthSnapshot', syscomHealthSnapshotSchema);
