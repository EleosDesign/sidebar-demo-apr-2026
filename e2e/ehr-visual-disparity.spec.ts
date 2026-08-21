import { expect, test, type Page } from '@playwright/test';

async function selectEhr(page: Page, label: string) {
  await page.locator('.demo-controls-hotzone').hover();
  await page.getByTitle('Switch EHR background').click();
  await page.getByRole('button', { name: label, exact: true }).click();
}

test('keeps both SmartCare backgrounds aligned with peer EHR density', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 648 });
  await page.goto('/');

  for (const [id, label] of [['streamline', 'Streamline'], ['calmhsa', 'CalMHSA SmartCare']]) {
    await selectEhr(page, label);

    const root = page.locator(`[data-ehr="${id}"]`);
    const header = root.locator('[data-smartcare-header]');
    const rail = root.locator('[data-smartcare-rail]');
    const title = root.locator('[data-smartcare-title]');
    const logo = header.getByRole('img', { name: 'SmartCare' });

    await expect(root).toHaveCSS('zoom', '1');
    await expect(header).toHaveCSS('height', '52px');
    await expect(rail).toHaveCSS('width', '240px');
    await expect(title).toHaveCSS('font-size', '20px');

    const headerBox = await header.boundingBox();
    const logoBox = await logo.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(logoBox).not.toBeNull();
    expect(logoBox!.y).toBeGreaterThanOrEqual(headerBox!.y);
    expect(logoBox!.y + logoBox!.height).toBeLessThanOrEqual(headerBox!.y + headerBox!.height);

    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await expect(root.locator('textarea').first()).toHaveCSS('font-size', '13px');
  }
});
