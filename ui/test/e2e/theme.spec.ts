import { expect, test } from '@playwright/test';

import {
  getCell,
  waitForGridReady,
  waitForStatsPageReady,
} from '@/test/e2e/helpers';

test.describe(`Theme`, () => {
  test.describe(`Grid Theme`, () => {
    test(`should render grid with proper styling`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();

      const headers = page.locator(`[role="columnheader"]`);
      await expect(headers.first()).toBeVisible();
    });
  });

  test.describe(`Dark Mode Styling`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);
    });

    test(`should have dark background on page`, async ({ page }) => {
      const body = page.locator(`body`);
      const bgColor = await body.evaluate(
        (el): string => globalThis.getComputedStyle(el).backgroundColor,
      );

      const rgbMatch = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeLessThan(128);
        expect(g).toBeLessThan(128);
        expect(b).toBeLessThan(128);
      }
    });

    test(`should render grid elements`, async ({ page }) => {
      const headerRow = page.locator(`[role="row"]:has([role="columnheader"])`);
      await expect(headerRow).toBeVisible();

      const dataRow = page
        .locator(`[role="row"]:has([role="gridcell"])`)
        .first();
      await expect(dataRow).toBeVisible();
    });
  });

  test.describe(`Theme Consistency`, () => {
    test(`should maintain theme on stats page`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const bodyBefore = await page
        .locator(`body`)
        .evaluate(
          (el): string => globalThis.getComputedStyle(el).backgroundColor,
        );

      const link = getCell(page, 0, 0).locator(`a`);
      await link.click();
      await waitForStatsPageReady(page);

      const bodyAfter = await page
        .locator(`body`)
        .evaluate(
          (el): string => globalThis.getComputedStyle(el).backgroundColor,
        );

      expect(bodyBefore).toBe(bodyAfter);
    });

    test(`should apply same theme to both pages`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);
      const matchesBg = await page
        .locator(`body`)
        .evaluate(
          (el): string => globalThis.getComputedStyle(el).backgroundColor,
        );

      const link = getCell(page, 0, 0).locator(`a`);
      await link.click();
      await waitForStatsPageReady(page);
      const statsBg = await page
        .locator(`body`)
        .evaluate(
          (el): string => globalThis.getComputedStyle(el).backgroundColor,
        );

      expect(matchesBg).toBe(statsBg);
    });
  });
});
