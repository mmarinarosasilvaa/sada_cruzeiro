const { expect } = require('@playwright/test');
const { SELECTORS, TYPOGRAPHY, LAYOUT, TOLERANCE_PX } = require('../constants/footer-section');

class FooterSectionComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  root() {
    return this.page.locator(SELECTORS.root).first();
  }

  topicTitle() {
    return this.page.locator(SELECTORS.topicTitle).first();
  }

  topicItem() {
    return this.page.locator(SELECTORS.topicItem).first();
  }

  copyright() {
    return this.page.locator(SELECTORS.copyright).first();
  }

  async expectFooterVisible() {
    await expect(this.root(), 'rodapé visível').toBeVisible();
    await expect(this.topicTitle(), 'titulo do tópico no rodapé').toBeVisible();
    await expect(this.topicItem(), 'item de tópico no rodapé').toBeVisible();
    await expect(this.copyright(), 'copyright no rodapé').toBeVisible();
  }

  async expectTopicTitleTypographyAndLayoutStrict() {
    await this.#expectTypography(this.topicTitle(), TYPOGRAPHY.topicTitle, 'footer topic title');
    await this.#expectLayout(this.topicTitle(), LAYOUT.topicTitle, 'footer topic title');
  }

  async expectTopicItemTypographyAndLayoutStrict() {
    await this.#expectTypography(this.topicItem(), TYPOGRAPHY.topicItem, 'footer topic item');
    await this.#expectLayout(this.topicItem(), LAYOUT.topicItem, 'footer topic item');
  }

  async expectCopyrightTypographyAndLayoutStrict() {
    await this.#expectTypography(this.copyright(), TYPOGRAPHY.copyright, 'footer copyright');
    await this.#expectLayout(this.copyright(), LAYOUT.copyright, 'footer copyright');
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {{fontFamily: RegExp, fontWeight: string, fontSize: string, lineHeight: string, letterSpacing: string[]}} expected
   * @param {string} label
   */
  async #expectTypography(locator, expected, label) {
    const style = await locator.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
      };
    });
    expect(style.fontFamily, `${label} font-family`).toMatch(expected.fontFamily);
    expect(style.fontWeight, `${label} font-weight`).toBe(expected.fontWeight);
    expect(style.fontSize, `${label} font-size`).toBe(expected.fontSize);
    expect(style.lineHeight, `${label} line-height`).toBe(expected.lineHeight);
    expect(expected.letterSpacing.includes(style.letterSpacing), `${label} letter-spacing`).toBeTruthy();
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {{width: number, height: number, top: number, left: number, opacity: number, angleDeg: number}} expected
   * @param {string} label
   */
  async #expectLayout(locator, expected, label) {
    const actual = await locator.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
      return {
        width: r.width,
        height: r.height,
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        opacity: parseFloat(s.opacity),
        angleDeg: Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI),
      };
    });

    expect(actual.width, `${label} width`).toBeGreaterThanOrEqual(expected.width - TOLERANCE_PX);
    expect(actual.width, `${label} width`).toBeLessThanOrEqual(expected.width + TOLERANCE_PX);
    expect(actual.height, `${label} height`).toBeGreaterThanOrEqual(expected.height - TOLERANCE_PX);
    expect(actual.height, `${label} height`).toBeLessThanOrEqual(expected.height + TOLERANCE_PX);
    expect(actual.top, `${label} top`).toBeGreaterThanOrEqual(expected.top - TOLERANCE_PX);
    expect(actual.top, `${label} top`).toBeLessThanOrEqual(expected.top + TOLERANCE_PX);
    expect(actual.left, `${label} left`).toBeGreaterThanOrEqual(expected.left - TOLERANCE_PX);
    expect(actual.left, `${label} left`).toBeLessThanOrEqual(expected.left + TOLERANCE_PX);
    expect(actual.opacity, `${label} opacity`).toBe(expected.opacity);
    expect(actual.angleDeg, `${label} angle`).toBe(expected.angleDeg);
  }
}

module.exports = { FooterSectionComponent };
