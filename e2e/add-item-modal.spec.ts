import { test, expect } from '@playwright/test';

test.describe('Add Item modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // If we were redirected to login, the Add Item button won't exist
    const loginHeading = page.getByRole('heading', { name: /log in/i });
    const onLogin = await loginHeading.isVisible().catch(() => false);
    if (onLogin) {
      test.skip(
        true,
        'Requires authenticated session; run with Supabase and log in first'
      );
    }
  });

  test('Add Item -> Add manually shows the form', async ({ page }) => {
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByRole('button', { name: /add manually/i }).click();
    await expect(page.getByLabel(/product name/i)).toBeVisible();
  });

  test('Add Item -> Scan barcode -> Enter manually shows the form', async ({
    page,
  }) => {
    // Mock camera to reject so the scanner shows the error/fallback UI
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        get: () => ({
          getUserMedia: () =>
            Promise.reject(
              new DOMException('Permission denied', 'NotAllowedError')
            ),
        }),
        configurable: true,
      });
    });
    await page.goto('/');

    const loginHeading = page.getByRole('heading', { name: /log in/i });
    if (await loginHeading.isVisible().catch(() => false)) {
      test.skip(true, 'Requires authenticated session');
    }

    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByRole('button', { name: /scan barcode/i }).click();

    // Scanner will fail (mocked); wait for "Enter barcode manually" or "Enter manually"
    const enterManual = page.getByRole('button', {
      name: /enter (barcode )?manually/i,
    });
    await expect(enterManual).toBeVisible({ timeout: 10000 });
    await enterManual.click();

    await expect(page.getByLabel(/product name/i)).toBeVisible();
  });
});
