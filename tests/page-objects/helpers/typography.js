const { expect } = require('@playwright/test');

/**
 * @param {import('@playwright/test').Locator} locator
 */
async function readComputedTypography(locator) {
  return locator.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      fontStretch: s.fontStretch,
      textAlign: s.textAlign,
    };
  });
}

function lineHeightIs100Percent(lineHeight, fontSizePx) {
  const lh = String(lineHeight).trim();
  if (lh === 'normal') return false;
  if (lh.endsWith('%')) return lh === '100%';
  const lhNum = parseFloat(lh);
  const fs = parseFloat(fontSizePx);
  if (!Number.isFinite(lhNum) || !Number.isFinite(fs) || fs <= 0) return false;
  return Math.abs(lhNum - fs) < 0.6;
}

function letterSpacingIsZero(letterSpacing) {
  const v = String(letterSpacing).trim();
  return v === 'normal' || v === '0px' || v === '0' || parseFloat(v) === 0;
}

/**
 * @param {import('@playwright/test').Locator} locator
 */
async function findRightAlignmentWithinHero(locator) {
  return locator.evaluate((el) => {
    const hero = el.closest('.hero-player');
    if (!hero) return { ok: false, reason: 'sem .hero-player ancestral' };
    let node = /** @type {HTMLElement | null} */ (el);
    while (node && node !== hero) {
      const s = window.getComputedStyle(node);
      const ta = s.textAlign;
      if (ta === 'right' || ta === 'end') return { ok: true, via: `text-align:${ta}`, el: node.tagName };

      const display = s.display;
      if (display === 'flex' || display === 'inline-flex') {
        const jc = s.justifyContent;
        if (jc === 'flex-end' || jc === 'end') return { ok: true, via: `flex justify-content:${jc}`, el: node.tagName };
      }
      if (display === 'grid' || display === 'inline-grid') {
        const ji = s.justifyItems;
        if (ji === 'end' || ji === 'right') return { ok: true, via: `grid justify-items:${ji}`, el: node.tagName };
      }
      const alignSelf = s.alignSelf;
      if (alignSelf === 'flex-end' || alignSelf === 'end') {
        return { ok: true, via: `align-self:${alignSelf}`, el: node.tagName };
      }
      const justifySelf = s.justifySelf;
      if (justifySelf === 'end' || justifySelf === 'right') {
        return { ok: true, via: `justify-self:${justifySelf}`, el: node.tagName };
      }
      node = node.parentElement;
    }
    return { ok: false, reason: 'nenhum alinhamento à direita encontrado até .hero-player' };
  });
}

/**
 * @param {Awaited<ReturnType<typeof readComputedTypography>>} style
 * @param {string} label
 */
function expectPositionTypography(style, label) {
  expect.soft(style.fontFamily, `${label} font-family`).toMatch(/noto sans/i);
  expect.soft(style.fontWeight, `${label} font-weight`).toBe('300');
  expect.soft(style.fontStyle, `${label} font-style`).toBe('italic');
  expect.soft(style.fontSize, `${label} font-size`).toBe('48px');
  expect.soft(
    lineHeightIs100Percent(style.lineHeight, style.fontSize),
    `${label} line-height ~100% do font-size (${style.lineHeight})`,
  ).toBeTruthy();
  expect.soft(letterSpacingIsZero(style.letterSpacing), `${label} letter-spacing ~0 (${style.letterSpacing})`).toBeTruthy();
}

/**
 * @param {Awaited<ReturnType<typeof readComputedTypography>>} style
 * @param {string} label
 */
function expectNameTypography(style, label) {
  expect.soft(style.fontFamily, `${label} font-family`).toMatch(/noto sans/i);
  expect.soft(style.fontWeight, `${label} font-weight`).toBe('700');
  const stretchOk =
    style.fontStretch === 'semi-condensed' ||
    style.fontStretch === '50%' ||
    /semi-condensed/i.test(style.fontStretch);
  expect.soft(stretchOk, `${label} font-stretch semi-condensed (${style.fontStretch})`).toBeTruthy();
  expect.soft(style.fontStyle, `${label} font-style`).toMatch(/normal|oblique/i);
  expect.soft(style.fontSize, `${label} font-size`).toBe('64px');
  expect.soft(
    lineHeightIs100Percent(style.lineHeight, style.fontSize),
    `${label} line-height ~100% (${style.lineHeight})`,
  ).toBeTruthy();
  expect.soft(letterSpacingIsZero(style.letterSpacing), `${label} letter-spacing ~0 (${style.letterSpacing})`).toBeTruthy();
}

module.exports = {
  readComputedTypography,
  findRightAlignmentWithinHero,
  expectPositionTypography,
  expectNameTypography,
  lineHeightIs100Percent,
  letterSpacingIsZero,
};
