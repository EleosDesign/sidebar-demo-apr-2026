import { test, expect, type Page } from '@playwright/test';

async function choose(page: Page, menu: string, name: string) {
  await page.locator('.demo-controls-hotzone').hover();
  await page.getByTitle(menu).click();
  await page.getByRole('button', { name, exact: true }).click();
}
async function start(page: Page, ehr: string) {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Enable Enhance features' }).uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await choose(page, 'Switch EHR background', ehr);
}

for (const ehr of ['Streamline', 'CalMHSA SmartCare']) {
  for (const sessionName of ['SUD Group', 'Anger Management Group']) {
    test(`${ehr}: ${sessionName} preserves source cards and appends to the correct fields`, async ({ page }) => {
      await start(page, ehr);
      await choose(page, 'Switch note type', 'Core Note (SmartCare)');
      await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));
      await page.getByText(sessionName, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Select session' }).click();
      await expect(page.locator('[data-smartcare-title]')).toHaveText('Group G/O Note');
      await page.getByRole('button', { name: 'Note', exact: true }).click();
      const expected = { groupSummary: 'Existing', serviceNote: 'Existing', documentPlan: 'Existing' };
      for (const id of Object.keys(expected)) await page.locator(`#group-go-${id}`).fill('Existing');
      const sourceSections = await page.evaluate(async name => {
        const modulePath = '/src/data/suggestions.js';
        const { GROUP_SUGGESTIONS_BY_NOTE_TYPE } = await import(modulePath);
        return GROUP_SUGGESTIONS_BY_NOTE_TYPE[name] as { section: string; cards: { field: string; content: string }[] }[];
      }, sessionName);
      for (const [index, section] of sourceSections.entries()) {
        // Scope duplicate card text (e.g. "No next steps were discussed.") to its participant.
        const sectionBody = page.getByText(section.section, { exact: true }).last().locator('../..');
        for (const source of section.cards) {
          const content = sectionBody.getByText(source.content, { exact: true });
          await expect(content).toBeVisible();
          const card = content.locator('xpath=ancestor::div[.//button[normalize-space()="Add to EHR"]][1]');
          const target = index === 0 ? 'groupSummary' : source.field.includes('Next Steps') ? 'documentPlan' : 'serviceNote';
          await card.getByRole('button', { name: 'Add to EHR', exact: true }).click();
          expected[target] += `\n\n${source.content}`;
          await expect(page.locator(`#group-go-${target}`)).toHaveClass('group-go-highlight');
          // Also ensure insertion did not change either of the other narrative fields.
          for (const [id, value] of Object.entries(expected)) await expect(page.locator(`#group-go-${id}`)).toHaveValue(value);
        }
      }
      await expect(page.locator('#group-go-objectivesComment')).toHaveValue('');
    });
  }
  test(`${ehr}: group panels fit with the sidebar open and at narrow content widths`, async ({ page }) => {
    await start(page, ehr);
    await choose(page, 'Switch note type', 'Group G/O Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));
    const form = page.locator('.group-go-note');
    for (const heading of ['Objectives Addressed by this Service', 'Summary', 'Service Note']) {
      await expect(form.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
    for (const width of [830, 600, 380, 280]) {
      await form.evaluate((element, width) => { element.style.width = `${width}px`; }, width);
      expect(await form.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return [...element.querySelectorAll('*')].every(child => {
          const rect = child.getBoundingClientRect();
          return !child.getClientRects().length || (rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1);
        });
      })).toBe(true);
    }
  });
  test(`${ehr}: shared group objectives, editable narratives, reset and availability`, async ({ page }) => {
    await start(page, ehr);
    await choose(page, 'Switch note type', 'Group G/O Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    const form = page.locator('.group-go-note');
    await expect(form.locator('textarea')).toHaveCount(4);
    for (const textarea of await form.locator('textarea').all()) await expect(textarea).toHaveValue('');
    for (const checkbox of await form.getByRole('checkbox').all()) await expect(checkbox).not.toBeChecked();
    await expect(form.getByLabel('Status 1.01')).toHaveValue('');
    await form.getByRole('checkbox', { name: /^1.01/ }).check();
    await form.getByRole('checkbox', { name: 'Goal # 1: Test', exact: true }).first().check();
    await form.getByLabel('Status 1.01').selectOption('Some Improvement');
    for (const id of ['objectivesComment', 'groupSummary', 'serviceNote', 'documentPlan']) await form.locator(`#group-go-${id}`).fill(id);
    await form.getByLabel('Show only selected items').check();
    await expect(form.getByText('Goal # 2:')).toHaveCount(0);
    await choose(page, 'Switch EHR background', ehr === 'Streamline' ? 'CalMHSA SmartCare' : 'Streamline');
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await expect(form.getByLabel('Show only selected items')).toBeChecked();
    await expect(form.getByLabel('Status 1.01')).toHaveValue('Some Improvement');
    await expect(form.getByRole('checkbox', { name: 'Goal # 1: Test', exact: true })).toBeChecked();
    for (const id of ['objectivesComment', 'groupSummary', 'serviceNote', 'documentPlan']) await expect(form.locator(`#group-go-${id}`)).toHaveValue(id);
    await choose(page, 'Switch note type', 'Group Note');
    await expect(form).toHaveCount(0);
    await choose(page, 'Switch note type', 'Group G/O Note');
    for (const textarea of await form.locator('textarea').all()) await expect(textarea).toHaveValue('');
    await expect(form.getByLabel('Status 1.01')).toHaveValue('');
    await expect(form.getByRole('checkbox', { name: /^1.01/ })).not.toBeChecked();
    await choose(page, 'Switch EHR background', 'Welligent');
    await page.locator('.demo-controls-hotzone').hover();
    await page.getByTitle('Switch note type').click();
    await expect(page.getByRole('button', { name: 'Group G/O Note', exact: true })).toHaveCount(0);
  });
}
