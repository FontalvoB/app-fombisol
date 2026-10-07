import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('la página de login carga', async ({ app, screen }) => {
  await app.open('/login');
  await expect(screen.getByRole('heading', 'Qué bueno verte de nuevo.')).toBeVisible();
  await expect(screen.getByPlaceholder('nombre.usuario')).toBeVisible();
  await expect(screen.getByPlaceholder('Ingresa tu contraseña')).toBeVisible();
});

test('la raíz redirige a /login sin sesión', async ({ app, browser }) => {
  await app.open('/');
  await expect(browser).toHaveURL(/\/login/);
});
