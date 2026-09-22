import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`main links open complete pages from the top at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#about');
    await page
      .getByRole('button', { name: 'Close and use necessary only' })
      .click();
    for (const [label, path] of [
      ['Our story', '/about'],
      ['How it works', '/how-it-works'],
      ['Request a pickup', '/pickup'],
      ['Meet the team', '/team'],
      ['Services & rates', '/services'],
    ]) {
      await page.evaluate(() =>
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'instant',
        }),
      );
      if (width < 901)
        await page.getByRole('button', { name: 'Open menu' }).click();
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const destinations = await nav
        .locator('a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(
        destinations.every(
          (href) => href?.startsWith('/') && !href.includes('#'),
        ),
      ).toBe(true);
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(path + '$'));
      await expect(page.locator('main h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      if (width < 901)
        await expect(
          page.getByRole('button', { name: 'Open menu' }),
        ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (path === '/about')
        await page.screenshot({
          path: `test-results/main-navigation-${width}.png`,
        });
    }
  });
}
