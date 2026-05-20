const { expect } = require('@playwright/test');

const FIGMA_HERO_TEXT_BOX = {
  width: 424,
  height: 87,
  top: 432,
  left: 80,
  opacity: 1,
  angleDeg: 0,
};

/**
 * @param {import('@playwright/test').Locator} locator — elemento do texto (ex.: div do nome)
 */
async function readLayoutRelativeToHero(locator) {
  return locator.evaluate((el) => {
    const hero = el.closest('.hero-player');
    if (!hero) throw new Error('Elemento fora de .hero-player');
    const he = hero.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = window.getComputedStyle(el);
    const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
    const angleDeg = Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
    return {
      width: r.width,
      height: r.height,
      top: r.top - he.top,
      left: r.left - he.left,
      opacity: parseFloat(s.opacity),
      angleDeg,
    };
  });
}

/**
 * @param {Awaited<ReturnType<typeof readLayoutRelativeToHero>>} metrics
 * @param {string} label
 * @param {{ tolerancePx?: number }} [opts]
 */
function expectLayoutMatchesFigma(metrics, label, opts = {}) {
  const tol = opts.tolerancePx ?? 1;
  expect.soft(metrics.width, `${label} width`).toBeGreaterThanOrEqual(FIGMA_HERO_TEXT_BOX.width - tol);
  expect.soft(metrics.width, `${label} width`).toBeLessThanOrEqual(FIGMA_HERO_TEXT_BOX.width + tol);
  expect.soft(metrics.height, `${label} height`).toBeGreaterThanOrEqual(FIGMA_HERO_TEXT_BOX.height - tol);
  expect.soft(metrics.height, `${label} height`).toBeLessThanOrEqual(FIGMA_HERO_TEXT_BOX.height + tol);
  expect.soft(metrics.top, `${label} top`).toBeGreaterThanOrEqual(FIGMA_HERO_TEXT_BOX.top - tol);
  expect.soft(metrics.top, `${label} top`).toBeLessThanOrEqual(FIGMA_HERO_TEXT_BOX.top + tol);
  expect.soft(metrics.left, `${label} left`).toBeGreaterThanOrEqual(FIGMA_HERO_TEXT_BOX.left - tol);
  expect.soft(metrics.left, `${label} left`).toBeLessThanOrEqual(FIGMA_HERO_TEXT_BOX.left + tol);
  expect.soft(metrics.opacity, `${label} opacity`).toBe(FIGMA_HERO_TEXT_BOX.opacity);
  expect.soft(metrics.angleDeg, `${label} ângulo (deg)`).toBe(FIGMA_HERO_TEXT_BOX.angleDeg);
}

module.exports = {
  FIGMA_HERO_TEXT_BOX,
  readLayoutRelativeToHero,
  expectLayoutMatchesFigma,
};
