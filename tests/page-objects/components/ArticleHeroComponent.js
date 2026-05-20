const { expect } = require('@playwright/test');

const SELECTORS = {
  title: 'xpath=/html/body/main/div[1]/div/div/div/div[3]/h1',
  author: 'xpath=/html/body/main/div[1]/div/div/div/div[3]/div/span[1]',
  updatedAt: 'xpath=/html/body/main/div[1]/div/div/div/div[3]/div/span[2]',
  photoCaption: 'xpath=/html/body/main/div[1]/div/div/div/div[1]/picture/figcaption',
};

class ArticleHeroComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  title() {
    return this.page.locator(SELECTORS.title);
  }

  author() {
    return this.page.locator(SELECTORS.author);
  }

  updatedAt() {
    return this.page.locator(SELECTORS.updatedAt);
  }

  photoCaption() {
    return this.page.locator(SELECTORS.photoCaption);
  }

  async expectVisible() {
    await expect(this.title(), 'título do hero article visível').toBeVisible();
    await expect(this.author(), 'autor do hero article visível').toBeVisible();
    await expect(this.updatedAt(), 'data de atualização visível').toBeVisible();
    await expect(this.photoCaption(), 'legenda da foto visível').toBeVisible();
  }

  async expectAccessibilityCompliance() {
    const report = await this.page.evaluate(() => {
      const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          Number.parseFloat(style.opacity || '1') > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const parseRgb = (value) => {
        if (!value) return null;
        const match = value.match(/rgba?\(([^)]+)\)/i);
        if (!match) return null;
        const [r, g, b, a] = match[1].split(',').map((p) => Number.parseFloat(p.trim()));
        return {
          r: Number.isFinite(r) ? r : 255,
          g: Number.isFinite(g) ? g : 255,
          b: Number.isFinite(b) ? b : 255,
          a: Number.isFinite(a) ? a : 1,
        };
      };
      const luminance = ({ r, g, b }) => {
        const toLinear = (v) => {
          const n = v / 255;
          return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
      };
      const blend = (fg, bg) => {
        const alpha = fg.a;
        return {
          r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
          g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
          b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
        };
      };
      const contrastRatio = (fg, bg) => {
        const l1 = luminance(fg);
        const l2 = luminance(bg);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };
      const getOpaqueBackground = (el) => {
        let current = el;
        while (current) {
          const parsed = parseRgb(window.getComputedStyle(current).backgroundColor);
          if (parsed && parsed.a > 0) return parsed;
          current = current.parentElement;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      };

      const h1 = document.querySelector('main h1');
      const nav = document.querySelector('main nav');
      const breadcrumbList = nav ? nav.querySelector('ol, ul') : null;
      const breadcrumbItems = breadcrumbList ? [...breadcrumbList.querySelectorAll('li')] : [];
      const authorMeta = document.querySelector('main h1 ~ div, main [class*="author"], main [class*="autor"]');
      const figure = document.querySelector('main figure');
      const figcaption = figure ? figure.querySelector('figcaption') : null;

      const heroContainer = h1?.closest('main') || document.querySelector('main');
      const images = heroContainer ? [...heroContainer.querySelectorAll('img')] : [];
      const linksAndButtons = heroContainer
        ? [...heroContainer.querySelectorAll('a, button')]
        : [];

      const sourceOrder = [];
      if (nav) sourceOrder.push({ key: 'breadcrumb', el: nav });
      if (h1) sourceOrder.push({ key: 'title', el: h1 });
      if (authorMeta) sourceOrder.push({ key: 'meta', el: authorMeta });
      if (figure || images[0]) sourceOrder.push({ key: 'image', el: figure || images[0] });
      const domOrder = heroContainer ? [...heroContainer.querySelectorAll('*')] : [];
      const sourceIndexes = sourceOrder.map((entry) => ({
        key: entry.key,
        index: domOrder.indexOf(entry.el),
      }));
      const sourceOrderPass = sourceIndexes.every((entry, idx) => {
        if (idx === 0) return true;
        const prev = sourceIndexes[idx - 1];
        return entry.index >= prev.index;
      });

      const imageChecks = images.map((img) => {
        const alt = (img.getAttribute('alt') || '').trim();
        const ariaHidden = img.getAttribute('aria-hidden') === 'true';
        const context = `${img.className || ''} ${img.id || ''} ${img.getAttribute('src') || ''}`.toLowerCase();
        const seemsAuthorPhoto = /author|autor|avatar|profile/.test(context);
        const decorative = ariaHidden || img.getAttribute('role') === 'presentation' || alt === '';
        return {
          alt,
          ariaHidden,
          seemsAuthorPhoto,
          decorative,
          pass:
            decorative ? ariaHidden : seemsAuthorPhoto ? /^Foto de\s+\S+/i.test(alt) : alt.length > 0,
        };
      });

      const contrastTargets = [h1, ...breadcrumbItems.map((li) => li.querySelector('a') || li), authorMeta, figcaption]
        .filter(Boolean)
        .filter((el) => isVisible(el));
      const contrastChecks = contrastTargets.map((el) => {
        const style = window.getComputedStyle(el);
        const fontSizePx = Number.parseFloat(style.fontSize || '16');
        const fontWeight = Number.parseInt(style.fontWeight || '400', 10);
        const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
        const minRatio = isLargeText ? 3 : 4.5;
        const fgParsed = parseRgb(style.color) || { r: 0, g: 0, b: 0, a: 1 };
        const bgParsed = getOpaqueBackground(el);
        const fgFinal = fgParsed.a < 1 ? blend(fgParsed, bgParsed) : fgParsed;
        const ratio = contrastRatio(fgFinal, bgParsed);
        return {
          text: normalizeText(el.textContent).slice(0, 60),
          ratio,
          minRatio,
          pass: ratio >= minRatio,
        };
      });

      const controlsChecks = linksAndButtons.map((control) => {
        const name =
          normalizeText(control.textContent) ||
          normalizeText(control.getAttribute('aria-label')) ||
          normalizeText(control.getAttribute('title'));
        const isLink = control.tagName.toLowerCase() === 'a';
        const href = control.getAttribute('href');
        const disabled = control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true';
        const tabIndex = Number.parseInt(control.getAttribute('tabindex') || '0', 10);
        return {
          tag: control.tagName.toLowerCase(),
          name,
          keyboardReachable: !disabled && tabIndex !== -1,
          hasValidAction: isLink ? Boolean(href && href.trim()) : true,
          pass: name.length > 0 && !disabled && tabIndex !== -1 && (isLink ? Boolean(href && href.trim()) : true),
        };
      });

      const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
      const lastBreadcrumbIsNotLink = lastBreadcrumb
        ? !lastBreadcrumb.querySelector('a')
        : false;

      return {
        semantics: {
          hasH1: Boolean(h1),
          hasNav: Boolean(nav),
          hasBreadcrumbList: Boolean(breadcrumbList),
          hasFigure: Boolean(figure),
          hasFigcaption: Boolean(figcaption),
        },
        sourceOrderPass,
        imageChecks,
        contrastChecks,
        controlsChecks,
        breadcrumbPurpose: {
          hasItems: breadcrumbItems.length > 1,
          lastIsNotLink: lastBreadcrumbIsNotLink,
        },
      };
    });

    expect(report.semantics.hasH1, 'hero article com h1').toBeTruthy();
    expect(report.semantics.hasNav, 'hero article com nav para breadcrumb').toBeTruthy();
    expect(report.semantics.hasBreadcrumbList, 'breadcrumb com ol/ul').toBeTruthy();
    expect(report.semantics.hasFigure, 'hero article com figure').toBeTruthy();
    expect(report.semantics.hasFigcaption, 'hero article com figcaption').toBeTruthy();
    expect(report.sourceOrderPass, 'ordem de leitura lógica no hero').toBeTruthy();

    for (const imageCheck of report.imageChecks) {
      expect(imageCheck.pass, `imagem acessível (alt/aria-hidden): ${JSON.stringify(imageCheck)}`).toBeTruthy();
    }

    for (const contrast of report.contrastChecks) {
      expect(
        contrast.pass,
        `contraste insuficiente para "${contrast.text}" (${contrast.ratio.toFixed(2)} < ${contrast.minRatio})`
      ).toBeTruthy();
    }

    expect(report.breadcrumbPurpose.hasItems, 'breadcrumb com ao menos 2 itens').toBeTruthy();
    expect(report.breadcrumbPurpose.lastIsNotLink, 'último item do breadcrumb não deve ser link').toBeTruthy();

    for (const control of report.controlsChecks) {
      expect(control.pass, `controle sem nome navegável por teclado: ${JSON.stringify(control)}`).toBeTruthy();
    }
  }

  async expectZoom200AndReflow320() {
    await this.page.setViewportSize({ width: 640, height: 960 });
    await this.page.waitForTimeout(150);
    await this.expectVisible();

    await this.page.setViewportSize({ width: 320, height: 800 });
    await this.page.waitForTimeout(150);
    await this.expectVisible();

    const noHorizontalScroll = await this.page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth <= root.clientWidth + 1;
    });
    expect(noHorizontalScroll, 'refluxo em 320px sem rolagem horizontal').toBeTruthy();
  }

  async logDesignSnapshot() {
    await this.#logDesignForLocator('titulo', this.title(), {
      layout: { width: 615, height: 240, top: 226, left: 80, opacity: 1, angleDeg: 0 },
      typography: {
        fontFamily: /noto[\s-]?sans/i,
        fontWeight: '800',
        fontStyle: /normal|extrabold/i,
        fontSize: '44px',
        lineHeight: ['44px', '100%'],
        letterSpacing: ['0px', 'normal'],
      },
    });

    await this.#logDesignForLocator('autor', this.author(), {
      layout: { width: 82, height: 19, top: 505, left: 120, opacity: 1, angleDeg: 0 },
      typography: {
        fontFamily: /noto[\s-]?sans/i,
        fontWeight: '600',
        fontStyle: /normal|semibold/i,
        fontSize: '14px',
        lineHeight: ['14px', '100%'],
        letterSpacing: ['0px', 'normal'],
      },
    });

    await this.#logDesignForLocator('atualizacao', this.updatedAt(), {
      layout: { width: 217, height: 19, top: 505, left: 210, opacity: 1, angleDeg: 0 },
      typography: {
        fontFamily: /noto[\s-]?sans/i,
        fontWeight: '500',
        fontStyle: /normal|medium/i,
        fontSize: '14px',
        lineHeight: ['14px', '100%'],
        letterSpacing: ['0px', 'normal'],
      },
    });

    await this.#logDesignForLocator('legenda-foto', this.photoCaption(), {
      layout: { width: 253, height: 36, opacity: 1 },
      typography: {
        fontFamily: /noto[\s-]?sans/i,
        fontWeight: '600',
        fontStyle: /normal|semibold/i,
        fontSize: '14px',
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

module.exports = { ArticleHeroComponent };
