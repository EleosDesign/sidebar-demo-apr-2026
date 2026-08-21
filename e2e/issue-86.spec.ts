import { expect, test, type Page } from '@playwright/test';

async function openCalmhsaProgressNote(page: Page) {
  await page.goto('/');
  await page.locator('.demo-controls-hotzone').hover();
  await page.getByTitle('Switch EHR background').click();
  await page.getByRole('button', { name: 'CalMHSA SmartCare', exact: true }).click();
  await page.locator('.demo-controls-hotzone').hover();
  await page.getByTitle('Switch note type').click();
  await page.getByRole('button', { name: 'Progress Note (CalMHSA)', exact: true }).click();
  await page.getByRole('button', { name: 'Note', exact: true }).click();
}

test('renders and preserves the CalMHSA Progress Note fields', async ({ page }) => {
  await openCalmhsaProgressNote(page);

  await expect(page.getByText('General', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Problem Details' })).toBeVisible();
  await expect(page.getByText('SNOMED CT Code', { exact: true })).toBeVisible();
  await expect(page.getByText('1264080008', { exact: true })).toBeVisible();
  await expect(page.getByText('Other psychoactive substance abuse, uncomplicated', { exact: true })).toBeVisible();

  for (const name of ['Problem Details', 'Problems addressed during this session', 'Information', 'Care Plan']) {
    const sectionBody = page.getByRole('heading', { name, exact: true }).locator('..').locator('..').locator(':scope > div').nth(1);
    expect(await sectionBody.evaluate(element => Number.parseFloat(getComputedStyle(element).borderTopWidth))).toBeLessThanOrEqual(2);
    await expect(sectionBody).toHaveCSS('border-top-color', 'rgb(214, 214, 214)');
  }
  const problemListTable = page.getByRole('heading', { name: 'Problem List', exact: true }).locator('..').locator('..').locator(':scope > div').nth(1);
  expect(await problemListTable.evaluate(element => Number.parseFloat(getComputedStyle(element).borderTopWidth))).toBeLessThanOrEqual(2);
  await expect(problemListTable).toHaveCSS('border-top-color', 'rgb(37, 74, 103)');
  await expect(page.getByRole('heading', { name: 'Information', exact: true })).toHaveCSS('border-right-width', '0px');
  await expect(page.getByRole('heading', { name: 'Care Plan', exact: true })).toHaveCSS('border-right-width', '0px');

  const information = page.getByRole('textbox', { name: 'Information' });
  const carePlan = page.getByRole('textbox', { name: 'Care Plan' });
  await expect(information).toHaveCSS('font-size', '13px');
  await expect(page.getByRole('button', { name: 'Insert', exact: true })).toHaveCSS('font-size', '13px');
  await information.fill('Information value');
  await carePlan.fill('Care plan value');

  await page.getByRole('button', { name: 'Service', exact: true }).click();
  await page.getByRole('button', { name: 'Note', exact: true }).click();
  await expect(information).toHaveValue('Information value');
  await expect(carePlan).toHaveValue('Care plan value');

  await page.setViewportSize({ width: 375, height: 667 });
  await carePlan.scrollIntoViewIfNeeded();
  await expect(carePlan).toBeVisible();
});
