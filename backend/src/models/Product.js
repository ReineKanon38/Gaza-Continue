// src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true // Elimina espacios al inicio y final
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 // El precio no puede ser negativo
  },
  description: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    trim: true 
  },
  image: { 
    type: String, 
    trim: true 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: 0 // El stock no puede ser negativo
  },
  syscomId: { 
    type: String, 
    unique: true, // Si sincronizas con SYSCOM, no puede haber duplicados
    sparse: true // Permite null/undefined, pero si hay valor, debe ser único
  },
  active: {
    type: Boolean,
    default: true // Por defecto, el producto está activo
  }
}, {
  timestamps: true // Esto agrega automáticamente 'createdAt' y 'updatedAt'
});

export default mongoose.model("Product", productSchema);