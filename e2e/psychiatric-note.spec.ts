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
  test(`${ehr}: Psychiatric Note sub-tabs, interactive controls, reset and EHR switch persistence`, async ({ page }) => {
    await start(page, ehr);
    await choose(page, 'Switch note type', 'Psychiatric Note');
    await expect(page.locator('[data-smartcare-title]')).toHaveText('Psychiatric Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();

    const note = page.locator('.psych-note');
    await expect(note).toBeVisible();

    // Verify all 6 tabs exist in the tab strip
    for (const tab of ['General', 'MSE', 'Medical Decision Making', 'AIMS', 'Diagnosis', 'Psychotherapy']) {
      await expect(note.getByRole('tab', { name: tab, exact: true })).toBeVisible();
    }

    // Tab 1: General initial state and interaction
    await expect(note.locator('#psych-todayChiefComplaint')).toHaveValue('');
    await note.locator('#psych-todayChiefComplaint').fill('Patient presents for psych follow-up');
    await note.locator('#psych-historyOfPresentIllness').fill('Detailed history of present illness text');
    await note.getByRole('radio', { name: 'Adult', exact: true }).check();
    await note.getByRole('checkbox', { name: 'Psychiatric', exact: true }).check();

    // Tab 2: Switch to MSE
    await note.getByRole('tab', { name: 'MSE', exact: true }).click();
    await expect(note.locator('#psych-mentalStatusComments')).toBeVisible();
    await expect(note.locator('#psych-mentalStatusComments')).toHaveValue('');
    await note.locator('#psych-mentalStatusComments').fill('Linear, cooperative, fair insight');
    await note.getByRole('checkbox', { name: 'All Within Normal Limits (WNL)', exact: true }).check();

    // Tab 3: Switch to MDM
    await note.getByRole('tab', { name: 'Medical Decision Making', exact: true }).click();
    await expect(note.locator('#psych-problemCondition')).toBeVisible();
    await note.locator('#psych-problemCondition').fill('First-episode psychosis, stable on current regimen');
    await note.locator('#psych-informationAndEducation').fill('Reviewed side effects and risks');

    // Tab 4: Switch to AIMS
    await note.getByRole('tab', { name: 'AIMS', exact: true }).click();
    await expect(note.getByLabel('AIMS facialExpression', { exact: true })).toBeVisible();
    await note.getByLabel('AIMS facialExpression', { exact: true }).selectOption('1 = Minimal, maybe extreme normal');

    // Tab 5: Switch to Diagnosis
    await note.getByRole('tab', { name: 'Diagnosis', exact: true }).click();
    await expect(note.getByRole('heading', { name: 'Diagnosis List' })).toBeVisible();
    await note.locator('#psych-otherMedicalCondition').fill('None reported');

    // Tab 6: Switch to Psychotherapy
    await note.getByRole('tab', { name: 'Psychotherapy', exact: true }).click();
    await note.getByRole('radio', { name: 'Yes', exact: true }).check();

    // EHR switch preserves all filled values and active tab
    const otherEhr = ehr === 'Streamline' ? 'CalMHSA SmartCare' : 'Streamline';
    await choose(page, 'Switch EHR background', otherEhr);
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await expect(note.getByRole('radio', { name: 'Yes', exact: true })).toBeChecked();

    // Check General tab values were preserved across EHR switch
    await note.getByRole('tab', { name: 'General', exact: true }).click();
    await expect(note.locator('#psych-todayChiefComplaint')).toHaveValue('Patient presents for psych follow-up');
    await expect(note.locator('#psych-historyOfPresentIllness')).toHaveValue('Detailed history of present illness text');

    // Check MSE tab preserved
    await note.getByRole('tab', { name: 'MSE', exact: true }).click();
    await expect(note.locator('#psych-mentalStatusComments')).toHaveValue('Linear, cooperative, fair insight');
    await expect(note.getByRole('checkbox', { name: 'All Within Normal Limits (WNL)', exact: true })).toBeChecked();

    // Switching away to another note type and back resets values
    await choose(page, 'Switch note type', 'Core Note (SmartCare)');
    await expect(page.locator('.psych-note')).toHaveCount(0);
    await choose(page, 'Switch note type', 'Psychiatric Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await expect(note.locator('#psych-todayChiefComplaint')).toHaveValue('');
    await note.getByRole('tab', { name: 'MSE', exact: true }).click();
    await expect(note.locator('#psych-mentalStatusComments')).toHaveValue('');

    // Verify Psychiatric Note does NOT appear in Welligent
    await choose(page, 'Switch EHR background', 'Welligent');
    await page.locator('.demo-controls-hotzone').hover();
    await page.getByTitle('Switch note type').click();
    await expect(page.getByRole('button', { name: 'Psychiatric Note', exact: true })).toHaveCount(0);
  });

  test(`${ehr}: Marlene Oviedo auto-selects Psychiatric Note and routes Add to EHR cards`, async ({ page }) => {
    await start(page, ehr);
    await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));

    // Select Marlene Oviedo from the Activities list
    await page.getByText('Marlene Oviedo', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Select session' }).click();

    // Verify Psychiatric Note is auto-selected
    await expect(page.locator('[data-smartcare-title]')).toHaveText('Psychiatric Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();

    // Find and add Chief Complaint suggestion card
    const ccCard = page.locator('div', { hasText: 'Chief Complaint' }).locator('xpath=ancestor::div[.//button[normalize-space()="Add to EHR"]][1]');
    await ccCard.getByRole('button', { name: 'Add to EHR' }).first().click();
    await expect(page.locator('#psych-todayChiefComplaint')).toHaveClass(/psych-highlight/);
    await expect(page.locator('#psych-todayChiefComplaint')).toContainText('housemates');

    // Find and add History of Present Illness card
    const hpiCard = page.locator('div', { hasText: 'History of Present Illness' }).locator('xpath=ancestor::div[.//button[normalize-space()="Add to EHR"]][1]');
    await hpiCard.getByRole('button', { name: 'Add to EHR' }).first().click();
    await expect(page.locator('#psych-historyOfPresentIllness')).toHaveClass(/psych-highlight/);
    await expect(page.locator('#psych-historyOfPresentIllness')).toContainText('Adult patient presenting');
  });

  test(`${ehr}: psychiatric note panels fit with sidebar open at narrow content widths`, async ({ page }) => {
    await start(page, ehr);
    await choose(page, 'Switch note type', 'Psychiatric Note');
    await page.getByRole('button', { name: 'Note', exact: true }).click();
    await page.evaluate(() => window.dispatchEvent(new Event('eleos:openSidebar')));

    const form = page.locator('.psych-note');
    await expect(form).toBeVisible();

    // Test responsive widths with all tabs
    for (const tab of ['General', 'MSE', 'Medical Decision Making', 'AIMS', 'Diagnosis', 'Psychotherapy']) {
    await form.getByRole('tab', { name: tab, exact: true }).click();
    for (const width of [830, 600, 380, 280]) {
      await form.evaluate((element, width) => { element.style.width = `${width}px`; }, width);
      const overflows = await form.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return [...element.querySelectorAll('*')]
          .filter(child => {
            const rect = child.getBoundingClientRect();
            return child.getClientRects().length && !child.closest('.psych-table-wrap') && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1);
          })
          .map(child => ({
            tag: child.tagName,
            id: child.id,
            className: child.className,
            text: child.textContent?.slice(0, 30),
            rect: [Math.round(child.getBoundingClientRect().left), Math.round(child.getBoundingClientRect().right)],
            bounds: [Math.round(bounds.left), Math.round(bounds.right)]
          }));
      });
      if (overflows.length > 0) {
        console.log(`Overflows at ${width}px:`, JSON.stringify(overflows.slice(0, 5)));
      }
      expect(overflows.length, `${tab} @ ${width}px`).toBe(0);
    }
    }
  });
}
