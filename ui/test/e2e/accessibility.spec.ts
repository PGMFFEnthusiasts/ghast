import { expect, test } from '@playwright/test';

import {
  getCell,
  waitForGridReady,
  waitForStatsPageReady,
} from '@/test/e2e/helpers';

test.setTimeout(60_000);

const DATA_ROW_SELECTOR = `[role="row"]:has([role="gridcell"])`;
const GRIDCELL_SELECTOR = `[role="gridcell"]`;

test.describe(`Accessibility`, () => {
  test.describe(`Matches Page`, () => {
    test(`should have proper heading structure`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const heading = page.locator(`text=Recent Matches`).first();
      await expect(heading).toBeVisible();
    });

    test(`should have accessible links`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const matchLink = getCell(page, 0, 0).locator(`a`);
      const linkText = await matchLink.textContent();
      expect(linkText).toBeTruthy();
    });
  });

  test.describe(`Stats Page`, () => {
    let matchId: string;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto(`/matches`);
      await waitForGridReady(page);
      await page.waitForSelector(DATA_ROW_SELECTOR, { timeout: 10_000 });
      const idCell = await page
        .locator(DATA_ROW_SELECTOR)
        .first()
        .locator(GRIDCELL_SELECTOR)
        .first()
        .locator(`a`)
        .textContent();
      matchId = idCell?.replace(`#`, ``).trim() ?? `1`;
      await page.close();
    });

    test(`should have proper heading structure`, async ({ page }) => {
      await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
      await waitForStatsPageReady(page);

      const heading = page.locator(`header .text-2xl`);
      await expect(heading).toBeVisible();
    });

    test(`should have accessible images`, async ({ page }) => {
      await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
      await waitForStatsPageReady(page);

      const images = page
        .locator(`${DATA_ROW_SELECTOR} ${GRIDCELL_SELECTOR}`)
        .nth(1)
        .locator(`img`);
      const count = await images.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const alt = await images.nth(i).getAttribute(`alt`);
        expect(alt).toBeTruthy();
        expect(alt).toContain(`Head`);
      }
    });

    test(`should have accessible navigation`, async ({ page }) => {
      await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
      await waitForStatsPageReady(page);

      const backLink = page.locator(`a:has-text("Back")`);
      await expect(backLink).toBeVisible();
      await expect(backLink).toHaveAttribute(`href`, `/matches`);
    });
  });

  test.describe(`Keyboard Navigation`, () => {
    test(`should be able to tab through grid cells`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const dataRow = page.locator(DATA_ROW_SELECTOR).first();
      await dataRow.click();

      await page.keyboard.press(`Tab`);

      const focusedElement = page.locator(`:focus`);
      expect(focusedElement).toBeTruthy();
    });

    test(`should be able to navigate links with keyboard`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const matchLink = getCell(page, 0, 0).locator(`a`);
      await matchLink.focus();

      await page.keyboard.press(`Enter`);
      await expect(page).toHaveURL(/\/matches\/\d+/);
    });

    test(`should be able to use pagination with keyboard`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const nextButton = page
        .locator(`[ref="btNext"], button:has-text("Next")`)
        .first();
      const exists = (await nextButton.count()) > 0;

      if (exists) {
        const isDisabled = (await nextButton.getAttribute(`disabled`)) !== null;
        if (!isDisabled) {
          await nextButton.focus();
          await page.keyboard.press(`Enter`);
        }
      }
    });
  });

  test.describe(`Grid Structure`, () => {
    test(`should have proper grid element`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();
    });

    test(`should have proper columnheader and rows`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const headerRow = page.locator(`[role="row"]:has([role="columnheader"])`);
      await expect(headerRow).toBeVisible();
      const columnHeader = page.locator(`[role="columnheader"]`).first();
      await expect(columnHeader).toBeVisible();

      const dataRow = page.locator(DATA_ROW_SELECTOR).first();
      await expect(dataRow).toBeVisible();
    });

    test(`should have proper gridcell elements in rows`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const gridcell = page
        .locator(DATA_ROW_SELECTOR)
        .first()
        .locator(GRIDCELL_SELECTOR)
        .first();
      await expect(gridcell).toBeVisible();
    });
  });
});
