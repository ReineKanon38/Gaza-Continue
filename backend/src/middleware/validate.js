import { ZodError } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync(req.body);
    req.validated = parsed; // guardar datos validados
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.errors.map(e => `${e.path.join('.') || 'campo'}: ${e.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validación fallida: ${errorDetails}`,
        errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};
