import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Importante: asegúrate de tener instalado bcryptjs

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// 🔒 MÉTODO PARA COMPARAR CONTRASEÑAS (Esto arregla tu error)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔐 ENCRIPTAR CONTRASEÑA ANTES DE GUARDAR (Seguridad obligatoria)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);
