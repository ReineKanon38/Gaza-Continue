import mongoose from 'mongoose';

const paymentMethodsSchema = new mongoose.Schema({
  bankTransfer: { type: Boolean, default: true },
  cash: { type: Boolean, default: false },
  creditCard: { type: Boolean, default: false },
  debitCard: { type: Boolean, default: false },
  paypal: { type: Boolean, default: false }
}, { _id: false });

const shippingMethodSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  enabled: { type: Boolean, default: true },
  cost: { type: Number, default: 0 },
  estimatedDays: { type: String, default: '' }
}, { _id: false });

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true, index: true },
  paymentMethods: { type: paymentMethodsSchema, default: () => ({}) },
  shippingMethods: {
    type: [shippingMethodSchema],
    default: () => ([
      {
        code: 'standard',
        name: 'Envio estandar',
        enabled: true,
        cost: 0,
        estimatedDays: '2-5 dias habiles'
      }
    ])
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('SystemConfig', systemConfigSchema);
