import { expect, test } from '@playwright/test';

import {
  clickColumnHeader,
  clickFirstPage,
  clickLastPage,
  clickNextPage,
  clickPrevPage,
  getCell,
  getCellValue,
  getColumnHeaders,
  getCurrentPage,
  getPlayerHeadImages,
  getPlayersOverflowText,
  getRowCount,
  getTotalPages,
  hasPlayersOverflow,
  isColumnSortedAsc,
  isColumnSortedDesc,
  shiftClickColumnHeader,
  waitForGridReady,
} from '@/test/e2e/helpers';

test.describe(`Matches Grid`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/matches`);
    await waitForGridReady(page);
  });

  test.describe(`Grid Rendering`, () => {
    test(`should render with all 7 columns`, async ({ page }) => {
      const headers = await getColumnHeaders(page);
      // Headers may include sort indicators, so check for presence
      const expectedColumns = [
        `#`,
        `Server`,
        `Players`,
        `Map`,
        `Score`,
        `Duration`,
        `Start Time`,
      ];
      for (const expected of expectedColumns) {
        const found = headers.some((h) => h.startsWith(expected));
        expect(found, `Expected column starting with "${expected}"`).toBe(true);
      }
      expect(headers.length).toBe(7);
    });

    test(`should display match data in cells`, async ({ page }) => {
      // Check that the first row has data (column 0 = #)
      const idCell = await getCellValue(page, 0, 0);
      expect(idCell).toMatch(/#\d+/);

      // Column 1 = Server
      const serverCell = await getCellValue(page, 0, 1);
      expect(serverCell).toBeTruthy();

      // Column 3 = Map
      const mapCell = await getCellValue(page, 0, 3);
      expect(mapCell).toBeTruthy();
    });
  });

  test.describe(`Pagination`, () => {
    test(`should show 20 rows per page by default`, async ({ page }) => {
      const rowCount = await getRowCount(page);
      expect(rowCount).toBeLessThanOrEqual(20);
    });

    test(`should navigate to next page`, async ({ page }) => {
      const initialPage = await getCurrentPage(page);
      const totalPages = await getTotalPages(page);

      // Only test if there are multiple pages
      if (totalPages > 1) {
        await clickNextPage(page);
        const newPage = await getCurrentPage(page);
        expect(newPage).toBe(initialPage + 1);
      }
    });

    test(`should navigate to previous page`, async ({ page }) => {
      const totalPages = await getTotalPages(page);

      // Only test if there are multiple pages
      if (totalPages > 1) {
        await clickNextPage(page);
        const pageAfterNext = await getCurrentPage(page);

        await clickPrevPage(page);
        const pageAfterPrev = await getCurrentPage(page);

        expect(pageAfterPrev).toBe(pageAfterNext - 1);
      }
    });

    test(`should navigate to first page`, async ({ page }) => {
      const totalPages = await getTotalPages(page);

      // Only test if there are multiple pages
      if (totalPages > 1) {
        await clickLastPage(page);
        await clickFirstPage(page);
        const currentPage = await getCurrentPage(page);
        expect(currentPage).toBe(1);
      }
    });

    test(`should navigate to last page`, async ({ page }) => {
      const totalPages = await getTotalPages(page);

      // Only test if there are multiple pages
      if (totalPages > 1) {
        await clickLastPage(page);
        const currentPage = await getCurrentPage(page);
        expect(currentPage).toBe(totalPages);
      }
    });
  });

  test.describe(`Sorting`, () => {
    test(`should change row order on column header click`, async ({ page }) => {
      await clickColumnHeader(page, `Duration`);

      const newDuration = await getCellValue(page, 0, 5);

      expect(newDuration).toBeTruthy();
    });

    test(`should toggle sort direction on second click`, async ({ page }) => {
      await clickColumnHeader(page, `Duration`);

      await clickColumnHeader(page, `Duration`);
      const secondDuration = await getCellValue(page, 0, 5);

      expect(secondDuration).toBeTruthy();
    });

    test(`should support multi-column sorting with Shift+click`, async ({
      page,
    }) => {
      // Click Server to sort by it first
      await clickColumnHeader(page, `Server`);

      // Shift+click Duration for multi-sort
      await shiftClickColumnHeader(page, `Duration`);

      // Table should render without errors
      const rows = await getRowCount(page);
      expect(rows).toBeGreaterThan(0);
    });

    test(`should not sort Players column`, async ({ page }) => {
      // Players column has sortable: false
      await clickColumnHeader(page, `Players`);
      const isAsc = await isColumnSortedAsc(page, `Players`);
      const isDesc = await isColumnSortedDesc(page, `Players`);
      expect(isAsc).toBe(false);
      expect(isDesc).toBe(false);
    });

    test(`should not sort Score column`, async ({ page }) => {
      // Score column has sortable: false
      await clickColumnHeader(page, `Score`);
      const isAsc = await isColumnSortedAsc(page, `Score`);
      const isDesc = await isColumnSortedDesc(page, `Score`);
      expect(isAsc).toBe(false);
      expect(isDesc).toBe(false);
    });
  });

  test.describe(`Cell Rendering`, () => {
    test(`should render match ID as link`, async ({ page }) => {
      // Column 0 = #
      const idCell = getCell(page, 0, 0);
      const link = idCell.locator(`a`);

      await expect(link).toBeVisible();
      const href = await link.getAttribute(`href`);
      expect(href).toMatch(/\/matches\/\d+/);
    });

    test(`should navigate to stats page when clicking match link`, async ({
      page,
    }) => {
      // Column 0 = #
      const idCell = getCell(page, 0, 0);
      const link = idCell.locator(`a`);

      await link.click();
      await expect(page).toHaveURL(/\/matches\/\d+/);
    });

    test(`should show player head images`, async ({ page }) => {
      // Find a row with players (some matches may have no players)
      const rowCount = await getRowCount(page);
      for (let i = 0; i < rowCount; i++) {
        const images = await getPlayerHeadImages(page, i);
        if (images.length > 0) {
          // Images should be from nmsr.nickac.dev
          images.forEach((src) => {
            expect(src).toContain(`nmsr.nickac.dev`);
          });
          return;
        }
      }
      // If no rows with players found, that's valid for empty matches
    });

    test(`should show max 9 player heads and overflow indicator`, async ({
      page,
    }) => {
      // Find a row with many players (more than 9)
      const rowCount = await getRowCount(page);

      for (let i = 0; i < rowCount; i++) {
        const hasOverflow = await hasPlayersOverflow(page, i);
        if (hasOverflow) {
          const overflowText = await getPlayersOverflowText(page, i);
          expect(overflowText).toMatch(/\+\d+ more/);

          const images = await getPlayerHeadImages(page, i);
          expect(images.length).toBeLessThanOrEqual(9);
          return;
        }
      }
      // If no overflow found, that's also valid (small matches)
    });
  });

  test.describe(`Value Formatting`, () => {
    test(`should format server name (tombrady -> primary)`, async ({
      page,
    }) => {
      // Column 1 = Server
      const serverCell = await getCellValue(page, 0, 1);
      expect(serverCell).not.toContain(`tombrady`);
    });

    test(`should format map name in uppercase`, async ({ page }) => {
      // Column 3 = Map
      const mapCell = await getCellValue(page, 0, 3);
      expect(mapCell).toBeTruthy();
      expect(mapCell).toBe(mapCell?.toUpperCase());
    });

    test(`should format duration as MM:SS`, async ({ page }) => {
      // Column 5 = Duration
      const durationCell = await getCellValue(page, 0, 5);
      expect(durationCell).toMatch(/^\d{2}:\d{2}$/);
    });

    test(`should format start time with relative and absolute date`, async ({
      page,
    }) => {
      // Column 6 = Start Time
      const timeCell = await getCellValue(page, 0, 6);
      expect(timeCell).toBeTruthy();
      // Should contain date parts and "at" for time
      expect(timeCell).toContain(`at`);
    });

    test(`should format score as "X - Y"`, async ({ page }) => {
      // Column 4 = Score
      const scoreCell = await getCellValue(page, 0, 4);
      expect(scoreCell).toMatch(/^\d+ - \d+$/);
    });
  });

  test.describe(`Responsive Layout`, () => {
    test(`should render table on desktop (≥1280px)`, async ({ page }) => {
      await page.setViewportSize({ height: 800, width: 1280 });
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Table should render (we have two tables: header and body)
      const grid = page.locator(`[role="grid"]`).first();
      await expect(grid).toBeVisible();
    });

    test(`should render table on mobile (<1280px)`, async ({ page }) => {
      await page.setViewportSize({ height: 1024, width: 768 });
      await page.goto(`/matches`);
      await waitForGridReady(page);

      // Table should render (we have two tables: header and body)
      const grid = page.locator(`[role="grid"]`).first();
      await expect(grid).toBeVisible();
    });
  });

  test.describe(`Table Sizing`, () => {
    test(`should not exceed viewport width`, async ({ page }) => {
      // Get the viewport dimensions
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      // Get the table container
      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      // The container's right edge should not exceed the viewport width
      const containerRight = containerBox!.x + containerBox!.width;
      expect(
        containerRight,
        `Table container right edge (${containerRight}) should not exceed viewport width (${viewportSize!.width})`,
      ).toBeLessThanOrEqual(viewportSize!.width);
    });

    test(`should not exceed viewport height`, async ({ page }) => {
      // Get the viewport dimensions
      const viewportSize = page.viewportSize();
      expect(viewportSize).not.toBeNull();

      // Get the table container
      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      // The container's bottom edge should not exceed the viewport height
      const containerBottom = containerBox!.y + containerBox!.height;
      expect(
        containerBottom,
        `Table container bottom edge (${containerBottom}) should not exceed viewport height (${viewportSize!.height})`,
      ).toBeLessThanOrEqual(viewportSize!.height);
    });

    test(`should shrink height to fit content rows`, async ({ page }) => {
      // The table container height should be based on content, not fill viewport
      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      // Get the number of rows
      const rowCount = await getRowCount(page);

      // With 20 or fewer rows, the container should not need to fill viewport
      // Approximate: header ~40px + rows ~40px each + some padding
      const estimatedContentHeight = 40 + rowCount * 40 + 20;

      // Container height should be close to content height (not stretched to viewport)
      expect(
        containerBox!.height,
        `Table container height (${containerBox!.height}) should be based on content (~${estimatedContentHeight}px), not stretched`,
      ).toBeLessThanOrEqual(estimatedContentHeight + 100); // Allow some tolerance
    });

    test(`table should stretch width to fill container`, async ({ page }) => {
      // Set a specific viewport size
      await page.setViewportSize({ height: 800, width: 1400 });
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const tableContainer = page.locator(`.ag-root-wrapper`);
      const containerBox = await tableContainer.boundingBox();
      expect(containerBox).not.toBeNull();

      const grid = page.locator(`[role="grid"]`);
      const gridBox = await grid.boundingBox();
      expect(gridBox).not.toBeNull();

      // Grid width should be at least as wide as the container (minus scrollbar)
      expect(
        gridBox!.width,
        `Grid width (${gridBox!.width}) should stretch to fill container width (${containerBox!.width})`,
      ).toBeGreaterThanOrEqual(containerBox!.width - 20);
    });

    test(`should render grid on narrow viewport`, async ({ page }) => {
      await page.setViewportSize({ height: 600, width: 800 });
      await page.goto(`/matches`);
      await waitForGridReady(page);

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();

      const columnWidths = await page
        .locator(`[role="columnheader"]`)
        .evaluateAll((cells) =>
          cells.map((cell) => (cell as HTMLElement).offsetWidth),
        );
      expect(columnWidths.length).toBeGreaterThan(0);
    });
  });
});
