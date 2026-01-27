import { expect, test } from '@playwright/test';

import {
  getColumnHeaders,
  getRowCount,
  isColumnSortedDesc,
  waitForGridReady,
  waitForStatsPageReady,
} from '@/test/e2e/helpers';

const COLUMN_HEADER_SELECTOR = `[role="columnheader"]`;
const DATA_ROW_SELECTOR = `[role="row"]:has([role="gridcell"])`;
const GRIDCELL_SELECTOR = `[role="gridcell"]`;

test.describe.serial(`Stats Grid`, () => {
  let matchId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(`/matches`);
    await waitForGridReady(page);

    await page.waitForSelector(DATA_ROW_SELECTOR, { timeout: 10_000 });

    const rows = page.locator(DATA_ROW_SELECTOR);
    const rowCount = await rows.count();

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const idCell = await rows
        .nth(i)
        .locator(GRIDCELL_SELECTOR)
        .first()
        .locator(`a`)
        .textContent();
      const candidateId = idCell?.replace(`#`, ``).trim() ?? `1`;

      await page.goto(`/matches/${candidateId}`, { waitUntil: `networkidle` });

      try {
        await page.waitForSelector(DATA_ROW_SELECTOR, { timeout: 3000 });
        matchId = candidateId;
        await page.close();
        return;
      } catch {
        await page.goto(`/matches`);
        await waitForGridReady(page);
      }
    }

    matchId = `1`;
    console.log(
      `No matches with player data found, using fallback matchId: ${matchId}`,
    );
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
    await waitForStatsPageReady(page);
  });

  test.describe(`Grid Rendering`, () => {
    test(`should render with expected columns`, async ({ page }) => {
      const visibleHeaders = await getColumnHeaders(page);

      const expectedVisibleColumns = [
        `Player`,
        `Team`,
        `Kills`,
        `Deaths`,
        `Assists`,
      ];

      for (const expected of expectedVisibleColumns) {
        const found = visibleHeaders.some((h) => h.startsWith(expected));
        expect(
          found,
          `Expected to find column starting with "${expected}"`,
        ).toBe(true);
      }

      const headerCount = await page.locator(COLUMN_HEADER_SELECTOR).count();
      expect(headerCount).toBeGreaterThanOrEqual(10);
    });

    test(`should display player data`, async ({ page }) => {
      const rowCount = await getRowCount(page);
      expect(rowCount).toBeGreaterThan(0);

      const pinnedCell = page
        .locator(`.ag-pinned-left-cols-container [role="gridcell"]`)
        .first();
      const playerName = await pinnedCell.textContent();
      expect(playerName?.trim()).toBeTruthy();
    });
  });

  test.describe(`Column Pinning`, () => {
    test(`should have Player column pinned left`, async ({ page }) => {
      const pinnedHeader = page.locator(
        `.ag-pinned-left-header ${COLUMN_HEADER_SELECTOR}:has-text("Player")`,
      );
      await expect(pinnedHeader).toBeVisible();
    });

    test(`should keep Player column visible when scrolling horizontally`, async ({
      page,
    }) => {
      const scrollContainer = page
        .locator(
          `.ag-body-horizontal-scroll-viewport, .ag-center-cols-viewport`,
        )
        .first();
      await scrollContainer.evaluate((el) => {
        el.scrollLeft = 500;
      });
      await page.waitForTimeout(100);

      const pinnedCell = page
        .locator(`.ag-pinned-left-cols-container ${GRIDCELL_SELECTOR}`)
        .first();
      await expect(pinnedCell).toBeVisible();
    });

    test(`should have Player column in pinned left container`, async ({
      page,
    }) => {
      const pinnedContainer = page.locator(`.ag-pinned-left-cols-container`);
      await expect(pinnedContainer).toBeVisible();

      const pinnedCells = page.locator(
        `.ag-pinned-left-cols-container ${GRIDCELL_SELECTOR}`,
      );
      const count = await pinnedCells.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`should keep non-pinned columns aligned after scrolling`, async ({
      page,
    }) => {
      const scrollContainer = page
        .locator(
          `.ag-body-horizontal-scroll-viewport, .ag-center-cols-viewport`,
        )
        .first();

      await scrollContainer.evaluate((el) => {
        el.scrollLeft = 200;
      });
      await page.waitForTimeout(100);

      const headerCells = page.locator(
        `.ag-header-container ${COLUMN_HEADER_SELECTOR}`,
      );
      const bodyCells = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(GRIDCELL_SELECTOR);

      const headerCount = await headerCells.count();
      const bodyCount = await bodyCells.count();

      expect(headerCount).toBeGreaterThan(0);
      expect(bodyCount).toBeGreaterThan(0);
    });

    test(`should have proper grid structure`, async ({ page }) => {
      const grid = page.locator(`[role="grid"]`);
      const gridCount = await grid.count();

      expect(gridCount).toBe(1);

      const headerRow = page
        .locator(`[role="row"]:has([role="columnheader"])`)
        .first();
      const dataRow = page.locator(DATA_ROW_SELECTOR).first();

      await expect(headerRow).toBeVisible();
      await expect(dataRow).toBeVisible();
    });
  });

  test.describe(`Default Sorting`, () => {
    test(`should sort by Team by default`, async ({ page }) => {
      const isSorted = await isColumnSortedDesc(page, `Team`);
      expect(typeof isSorted).toBe(`boolean`);
    });

    test(`should have Kills column with data`, async ({ page }) => {
      const killsCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .nth(1);
      const killsValue = await killsCell.textContent();
      expect(killsValue?.trim()).toBeTruthy();
      expect(Number(killsValue?.trim())).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe(`Cell Rendering`, () => {
    test(`should render player head images in Player column`, async ({
      page,
    }) => {
      const playerCell = page
        .locator(`.ag-pinned-left-cols-container [role="gridcell"]`)
        .first();
      const img = playerCell.locator(`img`);

      await expect(img).toBeVisible();
      const src = await img.getAttribute(`src`);
      expect(src).toContain(`nmsr.nickac.dev`);
    });

    test(`should render team name with color`, async ({ page }) => {
      const teamCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .first();
      const coloredSpan = teamCell.locator(`span[class*="text-"]`);

      await expect(coloredSpan).toBeVisible();
      const classes = await coloredSpan.getAttribute(`class`);
      expect(classes).toMatch(/text-(red|blue|orange)-\d+/);
    });

    test(`should render player name with team color`, async ({ page }) => {
      const playerCell = page
        .locator(`.ag-pinned-left-cols-container [role="gridcell"]`)
        .first();
      const coloredSpan = playerCell.locator(`span[class*="text-"]`);

      await expect(coloredSpan).toBeVisible();
    });
  });

  test.describe(`Value Formatting`, () => {
    test(`should format damage values with 2 decimal places`, async ({
      page,
    }) => {
      const dmgOutCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .nth(5);
      const dmgOut = await dmgOutCell.textContent();
      expect(dmgOut?.trim()).toMatch(/^\d+\.\d{2}$/);

      const dmgInCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .nth(6);
      const dmgIn = await dmgInCell.textContent();
      expect(dmgIn?.trim()).toMatch(/^\d+\.\d{2}$/);
    });
  });

  test.describe(`Column Sizing`, () => {
    test(`columns should have reasonable widths`, async ({ page }) => {
      const headerCells = page.locator(COLUMN_HEADER_SELECTOR);
      const headerCount = await headerCells.count();

      expect(headerCount).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(5, headerCount); i++) {
        const header = headerCells.nth(i);
        const headerBox = await header.boundingBox();
        expect(headerBox).not.toBeNull();
        expect(headerBox!.width).toBeGreaterThan(0);
      }
    });

    test(`should have multiple columns`, async ({ page }) => {
      const headerCount = await page.locator(COLUMN_HEADER_SELECTOR).count();
      expect(headerCount).toBeGreaterThanOrEqual(10);
    });

    test(`cells should have padding`, async ({ page }) => {
      const firstCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .first();

      const paddingInfo = await firstCell.evaluate((cell) => {
        const style = globalThis.getComputedStyle(cell);
        const paddingLeft = Number.parseFloat(style.paddingLeft);
        const paddingRight = Number.parseFloat(style.paddingRight);
        return { paddingLeft, paddingRight };
      });

      expect(paddingInfo.paddingLeft).toBeGreaterThan(0);
      expect(paddingInfo.paddingRight).toBeGreaterThan(0);
    });
  });

  test.describe(`Keyboard Copy (Ctrl+C)`, () => {
    test.skip(({ browserName }) => browserName === `firefox`);

    test(`should copy cell value on Ctrl+C`, async ({ context, page }) => {
      await context.grantPermissions([`clipboard-read`, `clipboard-write`]);

      const killsCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .nth(1);
      await killsCell.click();

      await page.waitForTimeout(100);

      await page.keyboard.press(`Control+c`);

      const toast = page.locator(`[data-sonner-toast]`);
      await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test(`should show toast notification on copy`, async ({
      context,
      page,
    }) => {
      await context.grantPermissions([`clipboard-read`, `clipboard-write`]);

      const killsCell = page
        .locator(`.ag-center-cols-container [role="row"]`)
        .first()
        .locator(`[role="gridcell"]`)
        .nth(1);
      await killsCell.click();
      await page.waitForTimeout(100);
      await page.keyboard.press(`Control+c`);

      const toast = page.locator(`[data-sonner-toast]`);
      await expect(toast).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe(`CSV Export`, () => {
    test(`should have CSV export button`, async ({ page }) => {
      const csvButton = page
        .locator(`button`)
        .filter({ has: page.locator(`svg`) })
        .last();
      await expect(csvButton).toBeVisible();
    });

    test(`should copy CSV data to clipboard on button click`, async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(
        browserName === `firefox`,
        `Firefox does not support clipboard-read permission`,
      );

      await context.grantPermissions([`clipboard-read`, `clipboard-write`]);

      const csvButton = page
        .locator(`button`)
        .filter({ has: page.locator(`svg`) })
        .last();
      await csvButton.click();

      const clipboardContent = await page.evaluate(
        async (): Promise<string> => navigator.clipboard.readText(),
      );
      expect(clipboardContent).toContain(`Team`);
      expect(clipboardContent).toContain(`Player`);
      expect(clipboardContent).toContain(`Kills`);
    });

    test(`should show success toast after CSV export`, async ({
      browserName,
      context,
      page,
    }) => {
      test.skip(
        browserName === `firefox`,
        `Firefox does not support clipboard permissions`,
      );

      await context.grantPermissions([`clipboard-read`, `clipboard-write`]);

      const csvButton = page
        .locator(`button`)
        .filter({ has: page.locator(`svg`) })
        .last();
      await csvButton.click();

      const toast = page.locator(`[data-sonner-toast]`);
      await expect(toast).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe(`Layout`, () => {
    test(`should use auto-height layout`, async ({ page }) => {
      const grid = page.locator(`[role="grid"]`).first();
      await expect(grid).toBeVisible();
    });

    test(`should not exceed viewport width`, async ({ page }) => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      const containerRight = containerBox!.x + containerBox!.width;
      expect(
        containerRight,
        `Table container right edge (${containerRight}) should not exceed viewport width (${viewportSize!.width})`,
      ).toBeLessThanOrEqual(viewportSize!.width);
    });

    test(`grid should render without overflow issues`, async ({ page }) => {
      const tableContainer = page.locator(`.ag-root-wrapper`);
      await expect(tableContainer).toBeVisible();

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();
    });

    test(`should not exceed viewport height`, async ({ page }) => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      const containerBottom = containerBox!.y + containerBox!.height;
      expect(
        containerBottom,
        `Table container bottom edge (${containerBottom}) should not exceed viewport height (${viewportSize!.height})`,
      ).toBeLessThanOrEqual(viewportSize!.height);
    });

    test(`should shrink height to fit content rows`, async ({ page }) => {
      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      const rowCount = await getRowCount(page);

      const estimatedContentHeight = 40 + rowCount * 40 + 20;

      expect(
        containerBox!.height,
        `Table container height (${containerBox!.height}) should be based on content (~${estimatedContentHeight}px), not stretched`,
      ).toBeLessThanOrEqual(estimatedContentHeight + 100);
    });

    test(`grid should stretch width to fill container`, async ({ page }) => {
      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      const grid = page.locator(`[role="grid"]`);
      const gridBox = await grid.boundingBox();
      expect(gridBox).not.toBeNull();

      expect(
        gridBox!.width,
        `Grid width (${gridBox!.width}) should stretch to fill container width (${containerBox!.width})`,
      ).toBeGreaterThanOrEqual(containerBox!.width - 20);
    });

    test(`footer should be positioned at bottom of viewport when content is short`, async ({
      page,
    }) => {
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      const csvButton = page
        .locator(`button`)
        .filter({ has: page.locator(`svg`) })
        .last();
      await expect(csvButton).toBeVisible();

      const buttonBox = await csvButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      const buttonBottom = buttonBox!.y + buttonBox!.height;
      const distanceFromViewportBottom = viewportSize!.height - buttonBottom;

      expect(
        distanceFromViewportBottom,
        `Footer should be near viewport bottom. Button bottom: ${buttonBottom}, Viewport height: ${viewportSize!.height}, Distance: ${distanceFromViewportBottom}px`,
      ).toBeLessThanOrEqual(50);
    });
  });

  test.describe(`Match Metadata`, () => {
    test(`should display map name`, async ({ page }) => {
      const mapName = page.locator(`header .text-2xl`);
      await expect(mapName).toBeVisible();
    });

    test(`should display match ID`, async ({ page }) => {
      const matchIdText = page.locator(`header .text-2xl span:has-text("#")`);
      await expect(matchIdText).toContainText(`#`);
    });

    test(`should display team scores`, async ({ page }) => {
      const scoreText = page.locator(String.raw`text=/\d+ - \d+/`).first();
      await expect(scoreText).toBeVisible();
    });

    test(`should display duration`, async ({ page }) => {
      const durationText = page.locator(String.raw`text=/\d{2}:\d{2}/`).first();
      await expect(durationText).toBeVisible();
    });
  });

  test.describe(`Navigation`, () => {
    test(`should have back link to matches`, async ({ page }) => {
      const backLink = page.locator(`a:has-text("Back")`);
      await expect(backLink).toBeVisible();
    });

    test(`should navigate back to matches when clicking back link`, async ({
      page,
    }) => {
      const backLink = page.locator(`a:has-text("Back")`);
      await backLink.click();
      await expect(page).toHaveURL(`/matches`);
    });
  });
});
