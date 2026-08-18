import { expect, test, type Page } from '@playwright/test';

async function openMobileActivities(page: Page) {
  await page.goto('/');
  await expect(page.getByText('Session Notes - ELEOS')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('button', { name: 'Mobile', exact: true }).click();
  await expect(page.getByText('My Captured Activities', { exact: true })).toBeVisible();
}

async function chooseActivityMethod(page: Page, method: 'Live session' | 'Voice summary') {
  await page.getByRole('button', { name: 'New activity', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'New activity' });
  await expect(dialog.getByRole('button', { name: 'Next' })).toBeDisabled();
  await dialog.getByRole('button', { name: new RegExp(`^${method}`) }).click();
  await dialog.getByRole('button', { name: 'Next' }).click();
}

test('starts Mobile Mode from the shared Activities list and opens Live Session capture', async ({ page }) => {
  await openMobileActivities(page);

  await expect(page.getByText('For Review', { exact: true })).toBeVisible();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh activities' }).click();
  await chooseActivityMethod(page, 'Live session');

  await expect(page.getByText('Capture Session', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('iPhone Microphone', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Capture Session' })).toBeDisabled();

  await page.getByPlaceholder('Select client').fill('Larry');
  await page.getByText('Larry Quinn', { exact: true }).click();
  await expect(page.getByText('Individual Therapy', { exact: true })).toBeVisible();
  await expect(page.getByText('Progress Note', { exact: true })).toBeVisible();
  await page.getByText('Setting', { exact: true }).click();
  await page.getByText('In Person', { exact: true }).click();

  await page.getByRole('button', { name: 'Capture Session' }).click();
  const readiness = page.getByRole('dialog', { name: 'Get ready to capture' });
  await expect(readiness).toBeVisible();
  await readiness.getByLabel("Don't show this message again").check();
  await readiness.getByRole('button', { name: 'Start session capture' }).click();

  await expect(page.getByRole('button', { name: 'End Session' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to activities' })).toHaveCount(0);
  await page.getByRole('button', { name: 'End Session' }).click();
  await expect(page.getByText('Audio capture completed')).toBeVisible();

  await page.getByRole('button', { name: /New Session|Start New Session/ }).click();
  await page.getByPlaceholder('Select client').fill('Larry');
  await page.getByText('Larry Quinn', { exact: true }).click();
  await page.getByText('Setting', { exact: true }).click();
  await page.getByText('In Person', { exact: true }).click();
  await page.getByRole('button', { name: 'Capture Session' }).click();
  await expect(page.getByRole('dialog', { name: 'Get ready to capture' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'End Session' })).toBeVisible();
});

test('confirms cancellation and completion of a Voice Summary', async ({ page }) => {
  await openMobileActivities(page);
  await chooseActivityMethod(page, 'Voice summary');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Start voice summary' }).click();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Cancel' }).click();
  const cancelDialog = page.getByRole('dialog', { name: 'Cancel recording' });
  await expect(cancelDialog.getByText('Are you sure?')).toBeVisible();
  await cancelDialog.getByRole('button', { name: 'Cancel Recording' }).click();
  await expect(page.getByText('Press to start capturing')).toBeVisible();

  await page.getByRole('button', { name: 'Start voice summary' }).click();
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Done' }).click();
  const doneDialog = page.getByRole('dialog', { name: 'Finish voice summary' });
  await expect(doneDialog.getByText('Are you done?')).toBeVisible();
  await doneDialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Physical Presentation', { exact: true })).toBeVisible();
});
