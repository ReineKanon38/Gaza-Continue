import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    productCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Category', categorySchema);
