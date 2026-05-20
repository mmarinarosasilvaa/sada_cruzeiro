const { test, expect } = require('@playwright/test');
const { getBaseUrl, getPlayerPageUrl } = require('../page-objects/constants/urls');

test('inspeção: navegação, HTML e screenshot', async ({ page }) => {
  const baseUrl = getBaseUrl();
  const playerUrl = getPlayerPageUrl();
  // eslint-disable-next-line no-console
  console.log('BASE_URL efetiva:', baseUrl);
  // eslint-disable-next-line no-console
  console.log('PLAYER_PAGE_URL:', playerUrl);

  const failed = [];
  page.on('requestfailed', (req) => {
    failed.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  const player = new PlayerPage(page);
  const response = await page.goto(playerUrl, { waitUntil: 'load', timeout: 90_000 });
  expect(response, 'response').toBeTruthy();
  const status = response.status();
  // eslint-disable-next-line no-console
  console.log('HTTP status:', status);
  // eslint-disable-next-line no-console
  console.log('page.url():', page.url());

  const html = await page.content();
  // eslint-disable-next-line no-console
  console.log('HTML length:', html.length, 'contains hero-player?', html.includes('hero-player'));

  const hero = page.locator('.hero-player');
  const count = await hero.count();
  const visible = count > 0 ? await hero.first().isVisible() : false;
  // eslint-disable-next-line no-console
  console.log('.hero-player count:', count, 'visible:', visible);
  // eslint-disable-next-line no-console
  console.log('failed requests (sample):', failed.slice(0, 15));

  await page.screenshot({ path: 'inspect-output.png', fullPage: true });

  expect(status).toBeLessThan(400);
  expect(html).toContain('hero-player');
  expect(count).toBeGreaterThan(0);
});
