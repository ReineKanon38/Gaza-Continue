// src/models/Order.js
import mongoose from "mongoose";

// Schema para cada producto dentro de una orden
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

// Schema para dirección de envío detallada
const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  neighborhood: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: "México",
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema para método de pago con tarjeta
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "cash"],
    required: true
  },
  cardType: {
    type: String,
    enum: ["visa", "mastercard", "amex", "discover", "other"],
    required: function() {
      return this.method === "credit_card" || this.method === "debit_card";
    }
  },
  cardLastFour: {
    type: String,
    trim: true
  },
  cardHolder: {
    type: String,
    trim: true
  }
}, { _id: false });

const paymentValidationSchema = new mongoose.Schema({
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema principal de Order
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  products: [orderItemSchema], // Array de productos
  total: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending_validation", "approved", "rejected"],
    default: "pending_validation"
  },
  paymentValidation: {
    type: paymentValidationSchema,
    default: () => ({})
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

export default mongoose.model("Order", orderSchema);