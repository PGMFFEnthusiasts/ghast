import type { Page } from '@playwright/test';

const GRID_SELECTOR = `[role="grid"]`;
const COLUMN_HEADER_SELECTOR = `[role="columnheader"]`;
const DATA_ROW_SELECTOR = `[role="row"]:has([role="gridcell"])`;
const GRIDCELL_SELECTOR = `[role="gridcell"]`;

export const waitForGridReady = async (page: Page): Promise<void> => {
  await page.waitForSelector(GRID_SELECTOR, { state: `visible` });
  await page.waitForSelector(DATA_ROW_SELECTOR, {
    state: `visible`,
    timeout: 10_000,
  });
};

export const getColumnHeaders = async (page: Page): Promise<string[]> => {
  const headers = await page.locator(COLUMN_HEADER_SELECTOR).allTextContents();
  return headers.map((h) => h.trim());
};

export const getRowCount = async (page: Page): Promise<number> =>
  page.locator(DATA_ROW_SELECTOR).count();

export const clickColumnHeader = async (
  page: Page,
  headerName: string,
): Promise<void> => {
  await page
    .locator(COLUMN_HEADER_SELECTOR)
    .filter({ hasText: headerName })
    .first()
    .click();
  await page.waitForTimeout(100);
};

export const shiftClickColumnHeader = async (
  page: Page,
  headerName: string,
): Promise<void> => {
  await page
    .locator(COLUMN_HEADER_SELECTOR)
    .filter({ hasText: headerName })
    .first()
    .click({ modifiers: [`Shift`] });
  await page.waitForTimeout(100);
};

export const openColumnFilter = async (
  _page: Page,
  _headerName: string,
): Promise<void> => {};

export const getCellValue = async (
  page: Page,
  rowIndex: number,
  colIndex: number,
): Promise<string | undefined> =>
  (await page
    .locator(DATA_ROW_SELECTOR)
    .nth(rowIndex)
    .locator(GRIDCELL_SELECTOR)
    .nth(colIndex)
    .textContent()) ?? undefined;

export const getCellValueByHeader = async (
  page: Page,
  rowIndex: number,
  headerName: string,
): Promise<string | undefined> => {
  const headers = await getColumnHeaders(page);
  const colIndex = headers.findIndex((h) => h.startsWith(headerName));
  return colIndex === -1 ? undefined : getCellValue(page, rowIndex, colIndex);
};

export const getCell = (page: Page, rowIndex: number, colIndex: number) =>
  page
    .locator(DATA_ROW_SELECTOR)
    .nth(rowIndex)
    .locator(GRIDCELL_SELECTOR)
    .nth(colIndex);

export const getCellByHeader = async (
  page: Page,
  rowIndex: number,
  headerName: string,
) => {
  const headers = await getColumnHeaders(page);
  const colIndex = headers.findIndex((h) => h.startsWith(headerName));
  return getCell(page, rowIndex, colIndex);
};

export const getCurrentPage = async (page: Page): Promise<number> => {
  const pageText = await page
    .locator(`.ag-paging-description`)
    .first()
    .textContent();
  const match = pageText?.match(/Page (\d+)|(\d+) of \d+/);
  return match ? Number.parseInt(match[1] ?? match[2], 10) : 1;
};

export const getTotalPages = async (page: Page): Promise<number> => {
  const pageText = await page
    .locator(`.ag-paging-description`)
    .first()
    .textContent();
  const match = pageText?.match(/of (\d+)/);
  return match ? Number.parseInt(match[1], 10) : 1;
};

export const clickNextPage = async (page: Page): Promise<void> => {
  const buttons = page.locator(`.ag-paging-button`);
  await buttons.nth(2).click();
  await page.waitForTimeout(200);
};

export const clickPrevPage = async (page: Page): Promise<void> => {
  const buttons = page.locator(`.ag-paging-button`);
  await buttons.nth(1).click();
  await page.waitForTimeout(200);
};

export const clickFirstPage = async (page: Page): Promise<void> => {
  const buttons = page.locator(`.ag-paging-button`);
  await buttons.nth(0).click();
  await page.waitForTimeout(200);
};

export const clickLastPage = async (page: Page): Promise<void> => {
  const buttons = page.locator(`.ag-paging-button`);
  await buttons.nth(3).click();
  await page.waitForTimeout(200);
};

export const isColumnSortedAsc = async (
  page: Page,
  headerName: string,
): Promise<boolean> => {
  await page.waitForTimeout(100);
  const header = page
    .locator(COLUMN_HEADER_SELECTOR)
    .filter({ hasText: headerName })
    .first();
  const text = await header.textContent();
  return (text?.includes(`\u2191`) ?? false) || (text?.includes(`↑`) ?? false);
};

export const isColumnSortedDesc = async (
  page: Page,
  headerName: string,
): Promise<boolean> => {
  await page.waitForTimeout(100);
  const header = page
    .locator(COLUMN_HEADER_SELECTOR)
    .filter({ hasText: headerName })
    .first();
  const text = await header.textContent();
  return (text?.includes(`\u2193`) ?? false) || (text?.includes(`↓`) ?? false);
};

export const getSortOrderIndicator = async (
  page: Page,
  headerName: string,
): Promise<string | undefined> => {
  const header = page
    .locator(`${COLUMN_HEADER_SELECTOR}:has-text("${headerName}")`)
    .first();
  const text = await header.textContent();
  const match = text?.match(/[↑↓]\s*(\d+)/);
  return match ? match[1] : undefined;
};

export const typeInFilterInput = async (
  _page: Page,
  _text: string,
): Promise<void> => {};

export const waitForFilterApplied = async (page: Page): Promise<void> => {
  await page.waitForTimeout(300);
};

export const getPlayerHeadImages = async (
  page: Page,
  rowIndex: number,
): Promise<string[]> => {
  const headers = await getColumnHeaders(page);
  const colIndex = headers.findIndex((h) => h.startsWith(`Players`));
  const cell = getCell(page, rowIndex, colIndex);
  const images = cell.locator(`img`);
  const count = await images.count();
  const srcs: string[] = [];
  for (let i = 0; i < count; i++) {
    const src = await images.nth(i).getAttribute(`src`);
    if (src) srcs.push(src);
  }
  return srcs;
};

export const hasPlayersOverflow = async (
  page: Page,
  rowIndex: number,
): Promise<boolean> => {
  const headers = await getColumnHeaders(page);
  const colIndex = headers.findIndex((h) => h.startsWith(`Players`));
  const cell = getCell(page, rowIndex, colIndex);
  const overflow = cell.locator(`span:has-text("more")`);
  return (await overflow.count()) > 0;
};

export const getPlayersOverflowText = async (
  page: Page,
  rowIndex: number,
): Promise<string | undefined> => {
  const headers = await getColumnHeaders(page);
  const colIndex = headers.findIndex((h) => h.startsWith(`Players`));
  const cell = getCell(page, rowIndex, colIndex);
  const overflow = cell.locator(`span:has-text("more")`);
  return (await overflow.textContent()) ?? undefined;
};

export const waitForStatsPageReady = async (page: Page): Promise<void> => {
  await page.waitForSelector(GRID_SELECTOR, {
    state: `visible`,
    timeout: 15_000,
  });
  await page.waitForSelector(DATA_ROW_SELECTOR, {
    state: `visible`,
    timeout: 10_000,
  });
};

export const isStatsPageLoaded = async (page: Page): Promise<boolean> => {
  const errorMessage = page.locator(`text=not found / invalid data`);
  const errorCount = await errorMessage.count();
  return errorCount === 0;
};

export const getHeaderBoundingRect = async (page: Page) => {
  const headerRow = page
    .locator(`[role="row"]:has([role="columnheader"])`)
    .first();
  return headerRow.boundingBox();
};

export const getFirstRowBoundingRect = async (page: Page) => {
  const row = page.locator(DATA_ROW_SELECTOR).first();
  return row.boundingBox();
};

export const getScrollContainer = (page: Page) =>
  page.locator(`.ag-root-wrapper`).first();

export const getScrollContainerRect = async (page: Page) => {
  const container = getScrollContainer(page);
  return container.boundingBox();
};

export const hasVerticalScrollbar = async (page: Page): Promise<boolean> => {
  const container = getScrollContainer(page);
  return container.evaluate((el) => el.scrollHeight > el.clientHeight);
};

export const hasHorizontalScrollbar = async (page: Page): Promise<boolean> => {
  const container = getScrollContainer(page);
  return container.evaluate((el) => el.scrollWidth > el.clientWidth);
};

export const getTotalColumnWidth = async (page: Page): Promise<number> =>
  page
    .locator(`[role="row"]:has([role="columnheader"])`)
    .first()
    .evaluate((row) => {
      const cells = row.querySelectorAll(`[role="columnheader"]`);
      return [...cells].reduce(
        (sum, cell) => sum + (cell as HTMLElement).offsetWidth,
        0,
      );
    });

export const getTableContainerWidth = async (page: Page): Promise<number> => {
  const container = getScrollContainer(page);
  return container.evaluate((el) => el.clientWidth);
};

export const getColumnWidths = async (page: Page): Promise<number[]> =>
  page
    .locator(COLUMN_HEADER_SELECTOR)
    .evaluateAll((cells) =>
      cells.map((cell) => (cell as HTMLElement).offsetWidth),
    );

export const getColumnLeftPositions = async (page: Page): Promise<number[]> =>
  page
    .locator(COLUMN_HEADER_SELECTOR)
    .evaluateAll((cells) =>
      cells.map((cell) => (cell as HTMLElement).getBoundingClientRect().left),
    );
