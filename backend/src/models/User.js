import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Importante: asegúrate de tener instalado bcryptjs

const savedShippingAddressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  neighborhood: { type: String, trim: true },
  locality: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, default: "México", trim: true },
  additionalInfo: { type: String, trim: true }
}, { _id: false });

const refreshTokenSessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedByHash: { type: String, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false },
  refreshTokens: { type: [refreshTokenSessionSchema], default: [] },
  savedShippingAddress: {
    type: savedShippingAddressSchema,
    default: () => ({ country: "México" })
  },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true });

// 🔒 MÉTODO PARA COMPARAR CONTRASEÑAS (Esto arregla tu error)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔐 ENCRIPTAR CONTRASEÑA ANTES DE GUARDAR (Seguridad obligatoria)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);
