import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');

export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Min 6 caracteres')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
});

export const requestResetSchema = z.object({
  email: z.string().email('Email inválido')
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nombre no puede estar vacío').optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6, 'Nueva contraseña mínima 6').optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, { message: 'currentPassword requerido si cambias contraseña', path: ['currentPassword'] });

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  price: z.number().nonnegative('Precio debe ser >= 0'),
  description: z.string().optional(),
  category: z.string().optional(),
  image: z.string().url('Debe ser URL válida').optional(),
  stock: z.number().int().nonnegative().optional(),
  syscomId: z.string().optional()
});

export const createOrderSchema = z.object({
  products: z.array(z.object({
    productId: objectId,
    quantity: z.number().int().positive('Cantidad > 0')
  })).min(1, 'Debe incluir al menos un producto'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Calle requerida'),
    number: z.string().min(1, 'Número requerido'),
    neighborhood: z.string().min(1, 'Colonia requerida'),
    city: z.string().min(1, 'Ciudad requerida'),
    state: z.string().min(1, 'Estado requerido'),
    zipCode: z.string().regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
    country: z.string().optional(),
    additionalInfo: z.string().optional()
  }),
  paymentInfo: z.object({
    method: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash']),
    cardType: z.enum(['visa', 'mastercard', 'amex', 'discover', 'other']).optional(),
    cardLastFour: z.string().regex(/^\d{4}$/, 'Últimos 4 dígitos inválidos').optional(),
    cardHolder: z.string().min(1, 'Nombre del titular requerido').optional()
  }).refine(data => {
    if (data.method === 'credit_card' || data.method === 'debit_card') {
      return data.cardType && data.cardLastFour;
    }
    return true;
  }, { message: 'Datos de tarjeta requeridos para pagos con tarjeta' })
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  notes: z.string().optional()
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending_validation', 'approved', 'rejected']).optional(),
  trackingNumber: z.string().min(1, 'Número de seguimiento requerido').optional(),
  notes: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1, 'Calle requerida'),
    number: z.string().min(1, 'Número requerido'),
    neighborhood: z.string().min(1, 'Colonia requerida'),
    city: z.string().min(1, 'Ciudad requerida'),
    state: z.string().min(1, 'Estado requerido'),
    zipCode: z.string().regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
    country: z.string().optional(),
    additionalInfo: z.string().optional()
  }).optional()
});

export const approveOrderPaymentSchema = z.object({
  reference: z.string().min(1, 'Referencia de pago requerida').optional(),
  notes: z.string().optional()
});

export const rejectOrderPaymentSchema = z.object({
  rejectionReason: z.string().min(3, 'Motivo de rechazo requerido'),
  notes: z.string().optional()
});

export const updatePaymentMethodsSchema = z.object({
  bankTransfer: z.boolean().optional(),
  cash: z.boolean().optional(),
  creditCard: z.boolean().optional(),
  debitCard: z.boolean().optional(),
  paypal: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un metodo de pago'
});

export const updateShippingMethodsSchema = z.object({
  shippingMethods: z.array(z.object({
    code: z.string().min(1, 'Codigo requerido'),
    name: z.string().min(1, 'Nombre requerido'),
    enabled: z.boolean(),
    cost: z.number().nonnegative('Costo invalido'),
    estimatedDays: z.string().min(1, 'Tiempo estimado requerido')
  })).min(1, 'Debes enviar al menos un metodo de envio')
});
