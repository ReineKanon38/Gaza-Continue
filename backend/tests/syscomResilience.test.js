import { describe, it, expect, vi } from 'vitest';
import syscomClient from '../src/utils/syscomClient.js';
import syscomService from '../src/services/syscomService.js';
import { searchSyscomProducts } from '../src/controllers/syscomController.js';

describe('Resiliencia y Fallback para API de SYSCOM', () => {
  it('debe tener configurado un timeout estricto de 4 segundos (4000ms)', () => {
    expect(syscomClient.timeoutMs).toBe(4000);
  });

  it('debe activar el modo Fallback cuando Axios lanza un error de Timeout (ECONNABORTED)', async () => {
    // Simular error de timeout en Axios
    const timeoutError = new Error('timeout of 4000ms exceeded');
    timeoutError.code = 'ECONNABORTED';

    vi.spyOn(syscomClient, 'getAccessToken').mockResolvedValue('mock_token');
    vi.spyOn(syscomClient, 'requestWithRetry').mockRejectedValue(timeoutError);

    const res = await syscomClient.getProduct('12345');

    expect(res.success).toBe(false);
    expect(res.isFallback).toBe(true);
    expect(res.isTimeout).toBe(true);
    expect(res.data.total_existencia).toBe(0); // Muestra 0 inventario como resiliencia de seguridad
    expect(res.data.isFallback).toBe(true);

    vi.restoreAllMocks();
  });

  it('el controlador debe devolver un 200 OK degradado sin tumbar la aplicación en caso de timeout', async () => {
    vi.spyOn(syscomService, 'searchProducts').mockResolvedValue({
      success: false,
      isFallback: true,
      isTimeout: true,
      error: 'Timeout de 4s excedido en la API de SYSCOM',
      data: [],
      pagination: { pagina: 1, paginas: 1, total: 0 }
    });

    const req = { query: { query: 'camara' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await searchSyscomProducts(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        isFallback: true,
        source: 'fallback'
      })
    );

    vi.restoreAllMocks();
  });
});
