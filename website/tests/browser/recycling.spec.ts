import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { recyclingItems, recyclingBins } from '../../lib/arcade-recycling';

for (const width of [390, 1440]) {
  test(`recycling sorts a full load with keyboard and tap at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/arcade');
    const privacy = page.getByRole('button', {
      name: 'Close and use necessary only',
      exact: true,
    });
    await privacy.click();
    await page
      .getByRole('button', { name: 'Play Recycling Bay', exact: true })
      .click();
    const bay = page.getByRole('region', { name: 'Recycling sorting game' });
    await expect(bay).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move up' })).toBeHidden();
    const initialRecords = await page.evaluate(() =>
      Object.entries(localStorage).filter(([key]) =>
        key.startsWith('bulk-away-arcade-best'),
      ),
    );
    await bay.getByRole('button', { name: 'Set aside 5' }).click();
    await expect(bay.getByRole('status')).toContainText('Try again');
    await expect(bay.getByRole('button', { name: 'Next item' })).toBeDisabled();
    const cabinet = page.locator('.arcade-cabinet');
    await cabinet.scrollIntoViewIfNeeded();
    expect((await cabinet.boundingBox())!.height).toBeLessThan(900);
    expect(await bay.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include('.recycling-bay').analyze())
        .violations,
    ).toEqual([]);
    await cabinet.screenshot({ path: `test-results/recycling-${width}.png` });
    for (let i = 0; i < 12; i++) {
      const heading = bay.getByRole('heading', { level: 3 });
      const name = await heading.textContent();
      const item = recyclingItems.find((item) => item.name === name)!;
      const bin = recyclingBins.find((bin) => bin.id === item.bin)!;
      if (width === 1440) {
        await heading.focus();
        await page.keyboard.press(bin.key);
      } else
        await bay
          .getByRole('button', { name: `${bin.label} ${bin.key}`, exact: true })
          .click();
      await expect(bay.getByRole('status')).toContainText('+');
      const next = bay.getByRole('button', {
        name: i === 11 ? 'Finish sorting' : 'Next item',
      });
      await expect(next).toBeFocused();
      await next.click();
    }
    await expect(
      page.getByRole('heading', { name: 'SORTED. NICE WORK!' }),
    ).toBeFocused();
    await expect(page.locator('.recycling-result')).toContainText(
      '11/12 first try',
    );
    await expect(
      page.getByRole('link', { name: 'Use my 5% reward' }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        Object.entries(localStorage).filter(([key]) =>
          key.startsWith('bulk-away-arcade-best'),
        ),
      ),
    ).toEqual(initialRecords);
    await page.getByRole('button', { name: 'Sort another load' }).click();
    await page.getByRole('button', { name: 'Back to my reward' }).click();
    await expect(page.locator('.recycling-result')).toContainText(
      '11/12 first try',
    );
  });
}

test('hauling results offer recycling without losing the earned reward', async ({
  page,
}) => {
  await page.goto('/arcade');
  await page.getByRole('button', { name: 'Close and use necessary only' }).click();
  await page.getByRole('button', { name: 'Start a 1-minute shift' }).click();
  await page.getByRole('button', { name: 'Pause game', exact: true }).click();
  await page.getByRole('button', { name: 'End this run' }).click();
  await page.getByRole('button', { name: 'Next stop: Recycling Bay' }).click();
  await expect(
    page.getByRole('region', { name: 'Recycling sorting game' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back to my reward' }).click();
  await expect(
    page.getByRole('link', { name: 'Use my 5% reward' }),
  ).toBeVisible();
});
