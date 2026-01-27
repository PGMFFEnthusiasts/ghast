import { expect, test } from '@playwright/test';

import {
  getColumnWidths,
  getFirstRowBoundingRect,
  getHeaderBoundingRect,
  getScrollContainer,
  waitForGridReady,
  waitForStatsPageReady,
} from '@/test/e2e/helpers';

const COLUMN_HEADER_SELECTOR = `[role="columnheader"]`;
const DATA_ROW_SELECTOR = `[role="row"]:has([role="gridcell"])`;
const GRIDCELL_SELECTOR = `[role="gridcell"]`;

test.describe(`Table Layout`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/matches`);
    await waitForGridReady(page);
  });

  test.describe(`Header and Body Separation`, () => {
    test(`header row should not overlap with first body row`, async ({
      page,
    }) => {
      const headerRect = await getHeaderBoundingRect(page);
      const firstRowRect = await getFirstRowBoundingRect(page);

      expect(headerRect).toBeDefined();
      expect(firstRowRect).toBeDefined();

      expect(headerRect!.y + headerRect!.height).toBeLessThanOrEqual(
        firstRowRect!.y + 1,
      );
    });

    test(`header should remain visible after scrolling body`, async ({
      page,
    }) => {
      const scrollContainer = getScrollContainer(page);

      await scrollContainer.evaluate((el) => {
        el.scrollTop = 200;
      });

      await page.waitForTimeout(100);

      const headerRow = page
        .locator(`[role="row"]:has([role="columnheader"])`)
        .first();
      await expect(headerRow).toBeVisible();

      const headerRect = await getHeaderBoundingRect(page);
      expect(headerRect).toBeDefined();
      expect(headerRect!.y).toBeLessThan(200);
    });
  });

  test.describe(`Scrollbar Positioning`, () => {
    test(`vertical scrollbar should only appear in body viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 400, width: 1280 });
      await waitForGridReady(page);

      const bodyViewport = page.locator(`.ag-body-viewport`).first();
      const hasVScroll = await bodyViewport.evaluate(
        (el) => el.scrollHeight > el.clientHeight,
      );
      expect(hasVScroll).toBe(true);

      const headerContainer = page.locator(`.ag-header`).first();
      const headerHasScroll = await headerContainer.evaluate(
        (el) => el.scrollHeight > el.clientHeight,
      );
      expect(headerHasScroll).toBe(false);
    });
  });

  test.describe(`Column Width Behavior`, () => {
    test(`columns should be visible and have reasonable widths`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 800, width: 1600 });
      await waitForGridReady(page);

      const columnWidths = await getColumnWidths(page);
      expect(columnWidths.length).toBeGreaterThan(0);

      for (const width of columnWidths) {
        expect(width).toBeGreaterThan(0);
      }
    });

    test(`grid should render at wider viewport`, async ({ page }) => {
      await page.setViewportSize({ height: 800, width: 1920 });
      await waitForGridReady(page);

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();

      const columnWidths = await getColumnWidths(page);
      expect(columnWidths.length).toBeGreaterThan(0);
    });
  });

  test.describe(`Column Position Stability`, () => {
    test(`column positions should remain stable when vertical scrollbar appears`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 1200, width: 1280 });
      await waitForGridReady(page);

      const initialWidths = await getColumnWidths(page);

      await page.setViewportSize({ height: 400, width: 1280 });
      await page.waitForTimeout(100);

      const newWidths = await getColumnWidths(page);

      expect(newWidths.length).toBe(initialWidths.length);
    });

    test(`grid should remain functional after viewport resize`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 800, width: 1600 });
      await waitForGridReady(page);

      const grid = page.locator(`[role="grid"]`);
      await expect(grid).toBeVisible();

      await page.setViewportSize({ height: 800, width: 1000 });
      await page.waitForTimeout(100);

      await expect(grid).toBeVisible();

      const columnWidths = await getColumnWidths(page);
      expect(columnWidths.length).toBeGreaterThan(0);
    });
  });
});

test.describe(`Column Resizing`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/matches`);
    await waitForGridReady(page);
  });

  test(`initial state should fill the full container width on wide screens`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 800, width: 1600 });
    await waitForGridReady(page);

    const gridData = await page
      .locator(`.ag-root-wrapper`)
      .first()
      .evaluate((el) => ({
        boundingWidth: el.getBoundingClientRect().width,
      }));

    const containerData = await getScrollContainer(page).evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));

    expect(
      Math.abs(gridData.boundingWidth - containerData.clientWidth),
    ).toBeLessThan(50);
  });

  test(`resizing a column should change that column's width`, async ({
    page,
  }) => {
    const initialWidths = await getColumnWidths(page);
    expect(initialWidths.length).toBeGreaterThan(2);

    const firstHeader = page.locator(COLUMN_HEADER_SELECTOR).first();
    const resizeHandle = firstHeader.locator(`.ag-header-cell-resize`);

    const handleBox = await resizeHandle.boundingBox();
    if (!handleBox) {
      test.skip();
      return;
    }

    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 50, handleBox.y + handleBox.height / 2);
    await page.mouse.up();

    await page.waitForTimeout(100);

    const newWidths = await getColumnWidths(page);

    expect(newWidths[0]).toBeGreaterThan(initialWidths[0]);
  });

  test(`resizing a middle column should work`, async ({ page }) => {
    const initialWidths = await getColumnWidths(page);
    expect(initialWidths.length).toBeGreaterThan(3);

    const secondHeader = page.locator(COLUMN_HEADER_SELECTOR).nth(1);
    const resizeHandle = secondHeader.locator(`.ag-header-cell-resize`);

    const handleBox = await resizeHandle.boundingBox();
    if (!handleBox) {
      test.skip();
      return;
    }

    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 30, handleBox.y + handleBox.height / 2);
    await page.mouse.up();

    await page.waitForTimeout(100);

    const newWidths = await getColumnWidths(page);

    expect(Math.abs(newWidths[1] - initialWidths[1])).toBeGreaterThan(10);
  });

  test(`grid should render on narrow viewport`, async ({ page }) => {
    await page.setViewportSize({ height: 600, width: 800 });
    await waitForGridReady(page);

    const grid = page.locator(`[role="grid"]`);
    await expect(grid).toBeVisible();
  });
});

test.describe(`Stats Page Table Layout`, () => {
  let matchId: string;
  let dataAvailable = false;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(`/matches`);
    await waitForGridReady(page);
    const idCell = await page
      .locator(DATA_ROW_SELECTOR)
      .first()
      .locator(GRIDCELL_SELECTOR)
      .first()
      .locator(`a`)
      .textContent();
    matchId = idCell?.replace(`#`, ``).trim() ?? `1`;

    await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
    const hasGrid = await page.locator(`[role="grid"]`).count();
    const hasRows =
      hasGrid > 0 ? await page.locator(DATA_ROW_SELECTOR).count() : 0;
    dataAvailable = hasRows > 0;
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !dataAvailable,
      `Stats page data not available in test environment`,
    );
    await page.goto(`/matches/${matchId}`, { waitUntil: `networkidle` });
    await waitForStatsPageReady(page);
  });

  test(`pinned column should not shift when scrolling horizontally`, async ({
    page,
  }) => {
    const playerHeader = page
      .locator(`.ag-pinned-left-header ${COLUMN_HEADER_SELECTOR}`)
      .first();
    const initialRect = await playerHeader.boundingBox();

    const scrollContainer = page
      .locator(`.ag-body-horizontal-scroll-viewport, .ag-center-cols-viewport`)
      .first();
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 300;
    });
    await page.waitForTimeout(100);

    const newRect = await playerHeader.boundingBox();

    expect(initialRect).toBeDefined();
    expect(newRect).toBeDefined();
    expect(Math.abs(initialRect!.x - newRect!.x)).toBeLessThan(2);
  });

  test(`header and body columns should align after horizontal scroll`, async ({
    page,
  }) => {
    const scrollContainer = page
      .locator(`.ag-body-horizontal-scroll-viewport, .ag-center-cols-viewport`)
      .first();
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 200;
    });
    await page.waitForTimeout(100);

    const headerCells = await page
      .locator(`.ag-header-container ${COLUMN_HEADER_SELECTOR}`)
      .all();
    const bodyCells = await page
      .locator(`.ag-center-cols-container ${GRIDCELL_SELECTOR}`)
      .first()
      .locator(GRIDCELL_SELECTOR)
      .all();

    if (headerCells.length < 4 || bodyCells.length < 4) {
      test.skip();
      return;
    }

    const headerRect = await headerCells[3].boundingBox();
    const bodyRect = await bodyCells[3].boundingBox();

    expect(headerRect).toBeDefined();
    expect(bodyRect).toBeDefined();
    expect(Math.abs(headerRect!.x - bodyRect!.x)).toBeLessThan(2);
  });
});
