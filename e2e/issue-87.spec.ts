import { expect, test, type Page } from '@playwright/test';

const information = 'The purpose of this session was to evaluate the client\'s mental status';
const carePlan = 'Throughout the session, client showed engagement when discussing their symptoms';

async function selectEhr(page: Page, name: string) {
  await page.locator('.demo-controls-hotzone').hover();
  await page.getByTitle('Switch EHR background').click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('uses CalMHSA Progress Note suggestions for Calvin Murphy', async ({ page }) => {
  await page.goto('/');
  await selectEhr(page, 'CalMHSA SmartCare');
  await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));
  await page.getByText('Calvin Murphy', { exact: true }).click();
  await page.getByRole('button', { name: 'Select session' }).click();

  await expect(page.getByTitle('Switch note type')).toContainText('Progress Note (CalMHSA)');
  await expect(page.getByText(information, { exact: false })).toBeVisible();
  await expect(page.getByText(carePlan, { exact: false })).toBeVisible();

  await selectEhr(page, 'Streamline');
  await expect(page.getByTitle('Switch note type')).toContainText('SOAP Note');
  await expect(page.getByText('Client stated, "It has been hard to leave the house."', { exact: false })).toBeVisible();
  await expect(page.getByText(information, { exact: false })).toHaveCount(0);

  await selectEhr(page, 'CalMHSA SmartCare');
  await expect(page.getByText(information, { exact: false })).toBeVisible();
  await expect(page.getByText(carePlan, { exact: false })).toBeVisible();
});
