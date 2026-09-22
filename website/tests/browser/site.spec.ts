import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const motion of ['reduce', 'site-pause', 'normal'] as const) {
  test('section dividers enter automatically and respect ' + motion, async ({ page }) => {
    await page.setViewportSize({ width: motion === 'reduce' ? 1440 : 390, height: 900 });
    if (motion === 'reduce') await page.emulateMedia({ reducedMotion: 'reduce' });
    else if (motion === 'site-pause') await page.addInitScript(() => sessionStorage.setItem('bulk-away-motion-v1', 'paused'));
    await page.goto('/');
    await dismissPrivacy(page);
    for (const variant of ['truck', 'star']) {
      const divider = page.locator('[data-section-divider="' + variant + '"]');
      await divider.scrollIntoViewIfNeeded();
      const before = await divider.boundingBox();
      const scrollY = await page.evaluate(() => window.scrollY);
      await expect(divider).toHaveAttribute('data-arrived', 'true');
      await expect(divider.locator('button, a, [tabindex]')).toHaveCount(0);
      const art = divider.locator('img');
      await art.evaluate(el => el instanceof HTMLImageElement ? el.decode() : undefined);
      if (motion === 'normal') {
        await art.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
        expect(await art.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
      } else {
        expect(await art.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
      }
      expect(await divider.boundingBox()).toEqual(before);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
      await page.evaluate(() => window.scrollTo(0, 0));
      await divider.scrollIntoViewIfNeeded();
      expect(await art.evaluate(el => el.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

async function dismissPrivacy(page: import('@playwright/test').Page) {
  await page
    .getByRole('button', { name: 'Close and use necessary only' })
    .click();
}

for (const path of [
  '/',
  '/services',
  '/about',
  '/how-it-works',
  '/pickup',
  '/team',
  '/arcade',
  '/privacy',
  '/sms',
  '/request',
]) {
  test(`${path} renders, hydrates and exposes accessible landmarks`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    if (!['/privacy', '/sms'].includes(path)) await dismissPrivacy(page);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('mobile navigation remains usable across pages and Escape returns focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await dismissPrivacy(page);
  for (const [label, path] of [
    ['Meet the team', '/team'],
    ['Services & rates', '/services'],
  ]) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/mobile-services.png',
    fullPage: false,
  });
});

test('team filter and before-after choices work after client navigation', async ({
  page,
}) => {
  await page.goto('/');
  await dismissPrivacy(page);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Meet the team', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Advisory board', exact: true })
    .click();
  await expect(page.locator('#crew-directory article:visible')).toHaveCount(5);
  await page.getByRole('button', { name: 'Business & operations' }).click();
  await expect(page.locator('#crew-directory article:visible')).toHaveCount(4);
  const nick = page.locator('#nick-loftin');
  await expect(page.getByRole('region', { name: 'Bulk Away crew.' }).locator('#nick-loftin')).toHaveCount(1);
  await expect(page.locator('#crew-directory #nick-loftin')).toHaveCount(0);
  await expect(nick.getByRole('heading', { name: 'Nick Loftin' })).toBeVisible();
  await expect(nick.getByText('Lead Bulk Technician', { exact: true })).toBeVisible();
  await nick.getByRole('button', { name: 'Show original photo of Nick Loftin' }).click();
  await expect(nick.locator('img')).toHaveAttribute('src', '/team/nick-loftin-original-640.webp');
  await nick.getByRole('button', { name: 'Back to atomic portrait of Nick Loftin' }).click();
  await expect(nick.locator('img')).toHaveAttribute('src', '/team/nick-loftin-640.webp');
  await page.getByRole('button', { name: 'Everyone', exact: true }).click();
  await expect(page.locator('#crew-directory article:visible')).toHaveCount(9);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Services & rates', exact: true })
    .click();
  const comparison = page.getByRole('figure', {
    name: 'Apartment trash out before and after',
    exact: true,
  });
  await comparison.getByRole('button', { name: 'After', exact: true }).click();
  await expect(comparison.getByRole('slider')).toHaveValue('100');
  await comparison.getByRole('slider').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(comparison.getByRole('slider')).toHaveValue('99');
});

test('native form works without JavaScript and preserves invalid inputs', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8793/');
  await page.locator('noscript a[href="/request"]').click();
  await expect(
    page.getByRole('heading', { name: 'Request a pickup.' }),
  ).toBeVisible();
  await page.locator('[name="name"]').fill('Test Visitor');
  await page.locator('[name="email"]').fill('test@example.com');
  await page.locator('[name="phone"]').fill('8015550100');
  await page.locator('[name="address"]').fill('Colorado');
  await page.locator('[name="service"]').selectOption('Trash outs');
  await page
    .locator('[name="details"]')
    .fill('Synthetic browser test. No real pickup.');
  await page.locator('[name="consent"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[name="consent"]')).toBeChecked();
  await page
    .getByRole('button', { name: 'Send pickup request', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#native-address-error')).toContainText(
    'full Utah',
  );
  await expect(page.locator('[name="name"]')).toHaveValue('Test Visitor');
  await context.close();
});

test('arcade starts, pauses and restores its controls without navigation errors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/arcade');
  await dismissPrivacy(page);
  await page.getByRole('button', { name: 'Start a 1-minute shift' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: /pause/i }).first().click();
  await expect(
    page.getByRole('button', { name: 'Resume shift' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/mobile-arcade.png',
    fullPage: false,
  });
});

test('enhanced pickup retains quantities, disclosures and errors through its three steps', async ({
  page,
}) => {
  await page.goto('/#request');
  await dismissPrivacy(page);
  const form = page.locator('#pickup-request form');
  await form.getByRole('combobox', { name: 'What’s the mission?' }).click();
  await page
    .getByRole('option', { name: 'Bulk item removal', exact: true })
    .click();
  const disclosure = form
    .locator('summary')
    .filter({ hasText: 'Choose items & quantities' });
  await disclosure.click();
  await form.getByRole('button', { name: 'Furniture', exact: true }).click();
  await form.getByRole('spinbutton', { name: 'Furniture quantity' }).fill('3');
  await form.getByRole('button', { name: 'Next: where & when' }).click();
  await form.locator('[name="address"]').fill('Colorado');
  await form.getByRole('button', { name: 'Next: your details' }).click();
  await expect(form.locator('#address-error')).toBeVisible();
  await form
    .locator('[name="address"]')
    .fill('123 Example Street, Salt Lake City, UT 84101');
  await form.getByRole('button', { name: 'Next: your details' }).click();
  await form
    .locator('summary')
    .filter({ hasText: 'Review & edit pickup details' })
    .click();
  await expect(form.locator('.pickup-review')).toContainText('Furniture');
  await expect(form.locator('.pickup-review')).toContainText('3');
  await form.locator('[name="name"]').fill('Test Visitor');
  await form.locator('[name="phone"]').fill('8015550100');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('[name="consent"]').check();
  await form.getByRole('button', { name: 'Send my pickup request' }).click();
  await expect(form.getByRole('alert').last()).toBeVisible();
  await expect(form.locator('[name="name"]')).toHaveValue('Test Visitor');
  await page.screenshot({
    path: 'test-results/desktop-pickup.png',
    fullPage: false,
  });
});
