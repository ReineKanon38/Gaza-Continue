import { ZodError } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync(req.body);
    req.validated = parsed; // guardar datos validados
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
};
