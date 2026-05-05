import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { lookupMexicanZipCode } from '../services/addressLookupService.js';

const router = express.Router();

router.get('/zip/:zipCode', requireAuth, async (req, res) => {
  try {
    const { zipCode } = req.params;
    const data = await lookupMexicanZipCode(zipCode);

    return sendSuccess(res, {
      message: 'Informacion de CP obtenida',
      data
    });
  } catch (error) {
    const isNotFound = /no encontrado|invalido/i.test(error.message || '');
    return sendError(res, {
      status: isNotFound ? 404 : 502,
      message: isNotFound ? error.message : 'No fue posible consultar el codigo postal',
      error: isNotFound ? undefined : error.message
    });
  }
});

export default router;
