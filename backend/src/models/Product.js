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
  brand: {
    type: String,
    trim: true,
    index: true // Facilita búsquedas por marca
  },
  model: {
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

// ÍNDICES DE ALTO RENDIMIENTO (SRE Performance Optimization)
// 1. Índice compuesto para filtrado por estado activo, categoría y ordenamiento por fecha
productSchema.index({ active: 1, category: 1, createdAt: -1 });

// 1.5 Índice compuesto para filtrado por estado activo, marca y ordenamiento
productSchema.index({ active: 1, brand: 1, createdAt: -1 });

// 2. Índices B-tree para búsquedas rápidas por nombre y descripción
productSchema.index({ active: 1, name: 1 });
productSchema.index({ active: 1, description: 1 });

// 3. Índice de texto para búsquedas full-text
productSchema.index({ name: 'text', description: 'text', brand: 'text' }, { weights: { name: 10, brand: 5, description: 1 } });

export default mongoose.model("Product", productSchema);