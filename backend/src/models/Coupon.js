import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'El código del cupón es requerido'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    discount: {
      type: Number,
      required: [true, 'El monto del descuento es requerido'],
      min: [0, 'El descuento no puede ser negativo']
    },
    maxUses: {
      type: Number,
      required: [true, 'El máximo de usos es requerido'],
      min: [1, 'Debe permitir al menos 1 uso']
    },
    usedCount: {
      type: Number,
      default: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      description: 'Monto mínimo de orden para aplicar cupón'
    },
    expiryDate: {
      type: Date,
      required: [true, 'La fecha de vencimiento es requerida']
    },
    active: {
      type: Boolean,
      default: true
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: []
      }
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: []
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Método para verificar si el cupón es válido
couponSchema.methods.isValid = function () {
  return (
    this.active &&
    this.usedCount < this.maxUses &&
    new Date() <= new Date(this.expiryDate)
  );
};

// Método para incrementar contador de uso
couponSchema.methods.incrementUsage = async function () {
  this.usedCount += 1;
  if (this.usedCount >= this.maxUses) {
    this.active = false;
  }
  return this.save();
};

export default mongoose.model('Coupon', couponSchema);
