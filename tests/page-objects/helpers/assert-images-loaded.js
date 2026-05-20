const { expect } = require('@playwright/test');

/**
 * @param {import('@playwright/test').Locator} scope
 */
async function assertImagesLoaded(scope) {
  const imgs = scope.locator('img');
  const count = await imgs.count();
  expect(count, 'deve existir ao menos uma imagem no escopo').toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const img = imgs.nth(i);
    await expect(img, `imagem ${i} visível`).toBeVisible();
    const dims = await img.evaluate((el) => ({
      w: el.naturalWidth,
      h: el.naturalHeight,
    }));
    expect(dims.w, `largura natural imagem ${i}`).toBeGreaterThan(0);
    expect(dims.h, `altura natural imagem ${i}`).toBeGreaterThan(0);
  }
}

module.exports = { assertImagesLoaded };
