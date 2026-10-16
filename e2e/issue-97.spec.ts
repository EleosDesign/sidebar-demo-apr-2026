import { expect, test, type Page } from '@playwright/test';

async function captureGroup(page: Page, name: string) {
  await page.goto('/');
  await expect(page.getByText('Session Notes - ELEOS')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));
  await expect(page.getByText('My Activities', { exact: true })).toBeVisible();

  await page.getByText('Capture', { exact: true }).click();
  await page.getByPlaceholder('Select client').fill(name);
  await page.getByText(name, { exact: true }).click();
  await expect(page.getByText('Group Therapy', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Capture Session' }).click();
  await page.getByRole('button', { name: 'End Session' }).click();
  await page.getByRole('button', { name: 'Go to Activities List' }).click();

  await page.getByText(name, { exact: true }).first().click();
  await page.getByRole('button', { name: 'Select session' }).click();
}

for (const { name, sections } of [
  {
    name: 'Anger Management Group',
    sections: ['Overall Summary', 'Tyler', 'Connor', 'Jeff', 'Allison', 'Participant 1'],
  },
  {
    name: 'SUD Group',
    sections: ['Group Summary', 'Lisette', 'Bethany', 'Tara', 'John', 'Participant 1'],
  },
]) {
  test(`live-captured ${name} uses its group suggestion layout`, async ({ page }) => {
    await captureGroup(page, name);

    for (const section of sections) {
      await expect(page.getByText(section, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText('Codes', { exact: true })).toHaveCount(0);
  });
}
