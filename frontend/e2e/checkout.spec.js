import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow & Stripe Payment', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Simular sesión autenticada en localStorage antes de navegar
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'userLoggedIn',
        'true'
      );
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          sub: 'e2e-user-id',
          name: 'E2E Tester',
          email: 'e2e@example.com',
          role: 'user'
        })
      );
      // Token JWT estructurado válido con fecha de expiración futura (exp: año 2050)
      const validMockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmUtdXNlci1pZCIsIm5hbWUiOiJFMkUgVGVzdGVyIiwiZW1haWwiOiJlMmVAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MjUyNDYwODAwMH0.mock_signature';
      
      window.localStorage.setItem('token', validMockToken);
      window.localStorage.setItem('accessToken', validMockToken);
      window.localStorage.setItem(
        'gaza-checkout-address',
        JSON.stringify({
          street: 'Av. Reforma',
          number: '123',
          neighborhood: 'Juárez',
          city: 'CDMX',
          state: 'CDMX',
          zipCode: '06600',
          country: 'México'
        })
      );
      window.localStorage.setItem(
        'syscom-cart',
        JSON.stringify({
          items: [
            {
              product: {
                _id: 'e2e-prod-1',
                name: 'Cámara IP 4K SYSCOM',
                price: 1250,
                stock: 10
              },
              quantity: 1
            }
          ]
        })
      );
    });
  });

  test('debe permitir ver el carrito, llenar dirección y procesar formulario de Stripe', async ({ page }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    };

    // Interceptar llamadas al API backend para pruebas E2E aisladas
    await page.route('**/api/address/**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            zipCode: '06600',
            state: 'CDMX',
            city: 'CDMX',
            municipality: 'Cuauhtémoc',
            neighborhoods: ['Juárez']
          }
        })
      });
    });

    await page.route('**/api/auth/shipping-address', async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({ data: { street: 'Av. Reforma', zipCode: '06600' } })
      });
    });

    await page.route('**/api/payment/methods', async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          methods: [
            {
              id: 'stripe_card',
              provider: 'stripe',
              name: 'Tarjeta de Crédito / Débito',
              description: 'Pago seguro en línea vía Stripe',
              enabled: true
            }
          ]
        })
      });
    });

    await page.route('**/api/payment/create-session', async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          paymentSessionId: 'pi_3MtwBwLkdIwHu7ix28a3t0AL',
          clientSecret: 'pi_3MtwBwLkdIwHu7ix28a3t0AL_secret_Yr9ahsAfzWOBKKGoTcMwWhp3',
          paymentStatus: 'requires_payment_method',
          provider: 'stripe',
          isSandbox: true
        })
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 201,
          message: 'Orden creada exitosamente',
          data: {
            _id: 'ord_e2e_9999',
            orderId: 'ORD-E2E-9999',
            total: 1250,
            status: 'pending',
            paymentStatus: 'approved'
          }
        })
      });
    });

    // 2. Navegar a la página de Carrito
    await page.goto('/cart');
    await expect(page).toHaveURL('/cart');

    // Verificar que el producto agregado al carrito está presente
    await expect(page.locator('text=Cámara IP 4K SYSCOM')).toBeVisible();

    // 3. Hacer clic en Procesar Compra / Ir a Checkout
    const checkoutBtn = page.locator('button, a').filter({ hasText: /Proceder al Pago|Checkout|Pagar/i }).first();
    await checkoutBtn.click();
    await expect(page).toHaveURL('/checkout');

    // 4. Llenar formulario de dirección de envío
    await page.getByPlaceholder('Ej: Avenida Insurgentes').fill('Av. Reforma');
    await page.getByPlaceholder('Ej: 123 o S/N').fill('123');
    await page.getByPlaceholder('Ej: 12345').fill('06600');

    const coloniaSelect = page.locator('select').first();
    const coloniaInput = page.getByPlaceholder('Ej: Centro');
    if (await coloniaSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coloniaSelect.selectOption({ index: 1 });
    } else if (await coloniaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await coloniaInput.fill('Juárez');
    }

    // 5. Iniciar la sesión de pago
    const placeOrderBtn = page.locator('button').filter({ hasText: /Pagar con Tarjeta|Confirmar Pedido/i }).first();
    await placeOrderBtn.click();

    // 6. Confirmar la transacción en la pasarela de Stripe
    await page.locator('form').first().evaluate((form) => form.requestSubmit());

    // 7. Validación final de pantalla de éxito
    await expect(page.locator('text=/¡Pago Confirmado|¡Pedido Registrado|Resumen de la Transacción/i').first()).toBeVisible({ timeout: 10000 });
  });
});
