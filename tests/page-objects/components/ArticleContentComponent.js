const { expect } = require('@playwright/test');

const SELECTORS = {
  contentText: 'xpath=/html/body/main/div[2]/div[1]/div/div/article/p[2]',
};

class ArticleContentComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  contentText() {
    return this.page.locator(SELECTORS.contentText);
  }

  async expectVisible() {
    await expect(this.contentText(), 'texto principal do article visível').toBeVisible();
  }

  async logDesignSnapshot() {
    await this.#logDesignForLocator('article-content-texto', this.contentText(), {
      layout: { width: 718, height: 180, opacity: 1, angleDeg: 0 },
      typography: {
        fontFamily: /noto[\s-]?sans/i,
        fontWeight: '400',
        fontStyle: /normal|regular/i,
        fontSize: '20px',
        lineHeight: ['36px'],
        letterSpacing: ['0px', 'normal'],
      },
    });
  }

  async #logDesignForLocator(label, locator, expected) {
    const actual = await locator.evaluate((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const matrix = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
      return {
        layout: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top + window.scrollY),
          left: Math.round(rect.left + window.scrollX),
          opacity: Number.parseFloat(style.opacity),
          angleDeg: Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI),
        },
        typography: {
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
        },
      };
    });

    const diff = this.#buildDiff(actual, expected);
    // eslint-disable-next-line no-console
    console.log(`[article-design][${label}]`, { expected, actual, diff });
  }

  #buildDiff(actual, expected) {
    return {
      layout: this.#buildDiffMap(actual.layout, expected.layout || {}),
      typography: this.#buildDiffMap(actual.typography, expected.typography || {}),
    };
  }

  #buildDiffMap(actualMap, expectedMap) {
    const out = {};
    for (const [key, expectedValue] of Object.entries(expectedMap)) {
      const actualValue = actualMap[key];
      out[key] = {
        expected: expectedValue,
        actual: actualValue,
        matches: this.#matchesExpected(actualValue, expectedValue),
      };
    }
    return out;
  }

  #matchesExpected(actualValue, expectedValue) {
    if (expectedValue instanceof RegExp) return expectedValue.test(String(actualValue || ''));
    if (Array.isArray(expectedValue)) return expectedValue.includes(actualValue);
    return actualValue === expectedValue;
  }
}

module.exports = { ArticleContentComponent };
