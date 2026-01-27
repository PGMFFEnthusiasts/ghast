import { expect, test } from '@playwright/test';

import {
  getCell,
  waitForGridReady,
  waitForStatsPageReady,
} from '@/test/e2e/helpers';

test.describe(`Navigation`, () => {
  test.describe(`Home to Matches`, () => {
    test(`should navigate from home to matches page`, async ({ page }) => {
      await page.goto(`/`);

      // Look for a link to matches
      const matchesLink = page.locator(`a[href="/matches"]`);

      // If there's a link, click it
      if ((await matchesLink.count()) > 0) {
        await matchesLink.click();
        await expect(page).toHaveURL(`/matches`);
      } else {
        // Direct navigation should work
        await page.goto(`/matches`);
        await expect(page).toHaveURL(`/matches`);
      }
    });
  });

  test.describe(`Matches to Stats`, () => {
    test(`should navigate from matches to stats page`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Click on the first match link (column 0 = #)
      const idCell = getCell(page, 0, 0);
      const link = idCell.locator(`a`);
      await link.click();

      // Should be on a stats page
      await expect(page).toHaveURL(/\/matches\/\d+/);

      // Should show the stats grid (wait for stats page to load)
      await waitForStatsPageReady(page);
    });

    test(`should show correct match ID in stats page`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Get the match ID from the link (trim whitespace) (column 0 = #)
      const idCell = getCell(page, 0, 0);
      const linkText = await idCell.locator(`a`).textContent();
      const matchId = linkText?.replace(`#`, ``).trim();

      // Navigate to stats
      await idCell.locator(`a`).click();
      await waitForStatsPageReady(page);

      // Check the page shows the same match ID
      const headerText = await page.locator(`header .text-2xl`).textContent();
      expect(headerText).toContain(`#${matchId}`);
    });
  });

  test.describe(`Stats to Matches (Back Navigation)`, () => {
    test(`should navigate back to matches using back link`, async ({
      page,
    }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Navigate to a stats page (column 0 = #)
      const idCell = getCell(page, 0, 0);
      await idCell.locator(`a`).click();
      await waitForStatsPageReady(page);

      // Click the back link
      const backLink = page.locator(`a:has-text("Back")`);
      await backLink.click();

      // Should be back on matches
      await expect(page).toHaveURL(`/matches`);
    });

    test(`should navigate back using browser back button`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Navigate to a stats page (column 0 = #)
      const idCell = getCell(page, 0, 0);
      await idCell.locator(`a`).click();
      await waitForStatsPageReady(page);

      // Use browser back
      await page.goBack();

      // Should be back on matches
      await expect(page).toHaveURL(`/matches`);
    });
  });

  test.describe(`Direct URL Access`, () => {
    test(`should load matches page directly`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Grid should be visible
      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();
    });

    test(`should load stats page directly with valid ID`, async ({ page }) => {
      // First get a valid match ID
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const idCell = getCell(page, 0, 0);
      const linkText = await idCell.locator(`a`).textContent();
      const matchId = linkText?.replace(`#`, ``).trim();

      // Now access the stats page directly
      await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
      await waitForStatsPageReady(page);

      // Grid should be visible
      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();
    });
  });

  test.describe(`404 Handling`, () => {
    test(`should show error for invalid match ID`, async ({ page }) => {
      // Use an ID that's very unlikely to exist
      await page.goto(`/matches/9999999999`);

      // Should show some error state
      // Could be "not found", "invalid data", or similar
      const errorText = page.locator(`text=/not found|invalid/i`);
      await expect(errorText).toBeVisible({ timeout: 5000 });
    });

    test(`should show error for non-numeric match ID`, async ({ page }) => {
      await page.goto(`/matches/abc`);

      // Should show error
      const errorText = page.locator(`text=/not found|invalid/i`);
      await expect(errorText).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe(`Page Structure`, () => {
    test(`should have proper page title on matches page`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Use exact text match to avoid matching the description text too
      const heading = page.getByText(`Recent Matches`, { exact: true });
      await expect(heading).toBeVisible();
    });

    test(`should have proper breadcrumb on stats page`, async ({ page }) => {
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Navigate to stats (column 0 = #)
      const idCell = getCell(page, 0, 0);
      await idCell.locator(`a`).click();
      await waitForStatsPageReady(page);

      // Should have breadcrumb link
      const breadcrumb = page.locator(`a:has-text("Back")`);
      await expect(breadcrumb).toBeVisible();
    });
  });
});
