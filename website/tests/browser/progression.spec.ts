import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`level remains stable with advance hazard notice at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install();
    await page.goto('/arcade');
    await page
      .getByRole('button', { name: 'Close and use necessary only' })
      .click();
    await page.getByRole('button', { name: 'Start a 1-minute shift' }).click();
    const cabinet = page.locator('.arcade-cabinet');
    await expect(cabinet).toHaveAttribute('data-phase', 'playing');
    const title = page.locator('.arcade-level-line');
    const notice = page.locator('.arcade-advance-notice');
    await expect(title).toHaveText('Level 1/3 · Neighborhood Sweep');
    const position = await page.locator('canvas').boundingBox();
    await page.clock.runFor(16000);
    await expect(notice).toContainText('UFOs approaching');
    await expect(title).toHaveText('Level 1/3 · Neighborhood Sweep');
    expect(await page.locator('canvas').boundingBox()).toEqual(position);
    await page.clock.runFor(6000);
    await expect(title).toHaveText('Level 1/3 · Neighborhood Sweep');
    await expect(notice).not.toContainText('UFOs approaching');
    expect(await page.locator('canvas').boundingBox()).toEqual(position);
    expect((await cabinet.boundingBox())!.height).toBeLessThan(900);
    await cabinet.screenshot({ path: `test-results/progression-${width}.png` });
  });
}
