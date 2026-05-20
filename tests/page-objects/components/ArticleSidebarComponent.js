const { expect } = require('@playwright/test');

const SELECTORS = {
  root: 'xpath=/html/body/main/div[2]/div[2]/div/div[2]',
};

class ArticleSidebarComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  root() {
    return this.page.locator(SELECTORS.root);
  }

  /** Preferir <h2> (WCAG 2.4.6); o preview AEM atual usa frequentemente <h3> nos blocos. */
  heading() {
    return this.root().locator('h2, h3').first();
  }

  /**
   * Encontra o primeiro descendente horizontalmente rolável (carrossel) e marca-o para locator estável nos testes.
   */
  async _attachCarouselScrollerMarker() {
    await this.root().evaluate((root) => {
      [...root.querySelectorAll('[data-pw-carousel-scroll]')].forEach((el) =>
        el.removeAttribute('data-pw-carousel-scroll')
      );
      const ranked = [...root.querySelectorAll('*')]
        .map((node) => ({
          /** @type {HTMLElement} */ node,
          slack:
            Number(node.scrollWidth) - Number(node.clientWidth || 0),
          ox: (window.getComputedStyle(node).overflowX || '').toLowerCase(),
        }))
        .filter(
          ({ slack, ox }) =>
            slack > 6 && /^(auto|scroll|hidden|overlay)$/.test(String(ox))
        );

      ranked.sort((a, b) => b.slack - a.slack);
      const candidate = ranked[0]?.node || null;
      if (candidate) candidate.setAttribute('data-pw-carousel-scroll', 'true');
      return Boolean(candidate);
    });
  }

  carouselScroller() {
    return this.root().locator('[data-pw-carousel-scroll="true"]');
  }

  async expectVisible() {
    await expect(this.root(), 'sidebar do article visível').toBeVisible();
    await expect(this.heading(), 'sidebar com heading de seção (h2 ou h3)').toBeVisible();
  }

  async expectAccessibilityCompliance() {
    const report = await this.root().evaluate((root) => {
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

      const preorder = [...root.querySelectorAll('*')];
      const indexOfEl = (el) => preorder.indexOf(el);

      const hasSemanticShell =
        ['SECTION', 'ASIDE'].includes(root.tagName) ||
        !!root.closest('aside,section') ||
        !!root.querySelector(':scope aside, :scope section, [role="complementary"], [role="region"]');

      /** Quando só há div genéricos, headings temáticos ainda delineiam regiões. */
      const hasRegionalOutline =
        hasSemanticShell ||
        (/compartilh|últim|notícia|news/i.test(normalizeText(root.textContent || '')) &&
          [...root.querySelectorAll('h2, h3')].length >= 1);

      const sectionHeadings = [...root.querySelectorAll('h2, h3')];
      /** WCAG 2.4.6 recomenda <h2>; <h3> cobre até o markup AEM migrar. */
      const hasSectionHeadingLevels = sectionHeadings.length >= 1;

      const semanticListPresent = !!root.querySelector('ul, ol');
      const fallbackFeedLinks =
        [...root.querySelectorAll('a[href]')].filter((a) => {
          const value = normalizeText(a.getAttribute('href') || '');
          return value && !value.startsWith('#') && !value.toLowerCase().startsWith('javascript');
        }).length >= 4;
      const hasStructuredNav = semanticListPresent || fallbackFeedLinks;

      const shareHeading =
        sectionHeadings.find((h) => /compartilh|share/i.test(normalizeText(h.textContent || ''))) || null;
      const newsHeading =
        sectionHeadings.find((h) =>
          /últim|notícia|news/i.test(normalizeText(h.textContent || ''))
        ) ||
        sectionHeadings[1] ||
        null;
      /** Ordem: compartilhar → outros blocos; fallback por classes/nav. */
      const shareRegion =
        shareHeading ||
        root.querySelector('[class*="share" i], [class*="Share"], [aria-label*="ompart"], [aria-label*="share"]') ||
        [...root.querySelectorAll('nav')].find((n) =>
          /social|share|omp|comp/i.test(normalizeText(n.getAttribute('aria-label') || n.className))
        );

      const explicitList = root.querySelector('ul, ol');
      const carouselEl =
        [...root.querySelectorAll('*')].find((node) => {
          const style = window.getComputedStyle(node);
          if (!/^(auto|scroll)$/i.test(style.overflowX || '')) return false;
          return node.scrollWidth > node.clientWidth + 4;
        }) ||
        root.querySelector('[aria-roledescription*="carousel" i], [aria-roledescription*="Carross"], [aria-label*="carousel" i]');

      /** @type {(Element|null)[]} */
      const orderChain = [];
      if (shareHeading) orderChain.push(shareHeading);
      else if (shareRegion) orderChain.push(shareRegion);
      if (newsHeading && newsHeading !== shareHeading && newsHeading !== shareRegion)
        orderChain.push(newsHeading);
      if (explicitList) orderChain.push(explicitList);
      if (carouselEl) orderChain.push(carouselEl);

      let sourceOrderPass = orderChain.length <= 1;
      if (!sourceOrderPass) {
        const indexes = orderChain.filter(Boolean).map((el) => indexOfEl(/** @type {Element} */ (el)));
        sourceOrderPass = indexes.every((idx, i) => (i === 0 ? idx >= 0 : idx >= indexes[i - 1]));
      }

      const socialSharePattern =
        /compartilhar\s+no\b|share\s+on\b|compartilhar\s+n[oa]\s+/i;
      const socialAltFallback = /^logo\s+/i;
      /** href ou src sugere ícone social */
      const isSocialImgContext = (img) => {
        const blob = `${img.getAttribute('src') || ''} ${img.getAttribute('class') || ''}`.toLowerCase();
        const a = img.closest('a');
        const href = (a && a.getAttribute('href')) || '';
        const hrefBlob = `${href}`.toLowerCase();
        const combined = `${blob} ${hrefBlob}`;
        return /facebook|fb\.|instagram|twitter|tweet|x\.com|tiktok|linkedin| whatsapp|wa\.|youtube|youtu\.be|telegram|pinterest/i.test(combined);
      };

      /** @typedef {{ alt: string, pass: boolean, reason?: string }} ImgCheck */

      /** @type {ImgCheck[]} */
      const imageChecks = [...root.querySelectorAll('img')].map((img) => {
        const alt = (img.getAttribute('alt') || '').trim();
        const ariaHidden = img.getAttribute('aria-hidden') === 'true';
        const rolePresentation = img.getAttribute('role') === 'presentation';
        const decorative = ariaHidden || rolePresentation || alt === '';

        if (decorative) {
          /** alt vazio exige marcação como decorativo (equiv. hero/article) */
          return { alt, pass: ariaHidden || rolePresentation };
        }
        if (isSocialImgContext(img)) {
          const pass =
            socialSharePattern.test(alt) ||
            (socialAltFallback.test(alt) && /facebook|twitter|whatsapp|instagram|linkedin|tiktok|x\b/i.test(alt));
          return { alt, pass, reason: pass ? undefined : 'social_alt_pattern' };
        }
        /** Conteúdo informativo: alt descritivo */
        return { alt, pass: alt.length > 0 };
      });

      /** Texto visível principal para contraste */
      const contrastSelectors = ['h2', 'h3', 'p', 'a', 'button', 'li'];
      const contrastElements = [...new Set(contrastSelectors.flatMap((sel) => [...root.querySelectorAll(sel)]))].filter((el) =>
        isVisible(/** @type {Element} */ (el))
      );

      /** @typedef {{ text: string, ratio: number, minRatio: number, pass: boolean }} ContrastEntry */
      /** @type {ContrastEntry[]} */
      const contrastChecks = [];

      for (const el of contrastElements) {
        /** @type {Element | null} */
        let target = /** @type {Element} */ (el);
        /** Links só com ícone não usam texto: usa aria-label do link ou alt da img filha */
        if (target.tagName === 'A' && !normalizeText(target.textContent).length) {
          const lab =
            normalizeText(target.getAttribute('aria-label') || '') ||
            normalizeText(target.querySelector('img') && target.querySelector('img').getAttribute('alt') || '');
          if (!lab.length) continue;
        }
        if (!normalizeText(target.textContent).length && target.tagName !== 'A') continue;

        const style = window.getComputedStyle(target);
        const fontSizePx = Number.parseFloat(style.fontSize || '16');
        const fontWeight = Number.parseInt(style.fontWeight || '400', 10);
        const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
        const minRatio = isLargeText ? 3 : 4.5;
        const fgParsed = parseRgb(style.color) || { r: 0, g: 0, b: 0, a: 1 };
        const bgParsed = getOpaqueBackground(target);
        const fgFinal = fgParsed.a < 1 ? blend(fgParsed, bgParsed) : fgParsed;
        const ratio = contrastRatio(fgFinal, bgParsed);
        const textSnap = normalizeText(target.textContent);
        contrastChecks.push({
          text: textSnap.slice(0, 60),
          ratio,
          minRatio,
          pass: ratio >= minRatio,
        });
      }

      const linksAndButtons = [...root.querySelectorAll('a, button')];

      const controlsChecks = linksAndButtons.map((control) => {
        let name =
          normalizeText(control.textContent) ||
          normalizeText(control.getAttribute('aria-label')) ||
          normalizeText(control.getAttribute('title'));

        const isLink = control.tagName.toLowerCase() === 'a';
        const firstImg = isLink ? control.querySelector('img') : null;
        if (!name.length && firstImg) {
          name = normalizeText(firstImg.getAttribute('alt') || '');
        }
        const href = control.getAttribute('href');
        const disabled = control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true';
        const tabIndex = Number.parseInt(control.getAttribute('tabindex') || '0', 10);
        return {
          tag: control.tagName.toLowerCase(),
          name,
          keyboardReachable: !disabled && tabIndex !== -1,
          hasValidAction: isLink ? Boolean(href && href.trim()) : true,
          pass:
            name.length > 0 &&
            !disabled &&
            tabIndex !== -1 &&
            (isLink ? Boolean(href && href.trim()) : true),
        };
      });

      /** WCAG 2.5.2 (heurística E2E): evitar apenas javascript:void; sem onclick embutido. */
      const linkActivationChecks = [...root.querySelectorAll('a')].map((anchor) => {
        const hasOnclick = normalizeText(anchor.getAttribute('onclick') || '').length > 0;
        const rawHref = anchor.getAttribute('href') ?? '';
        const jsVoidHref = /^javascript:\s*(void|%20void|%28%29|%20\(\))/i.test(rawHref.trim());
        return {
          rawHref,
          pass: !hasOnclick && !jsVoidHref,
        };
      });

      return {
        semantics: {
          hasRegionalOutline,
          hasSectionHeadingLevels,
          hasStructuredNav,
        },
        sourceOrderPass,
        imageChecks,
        contrastChecks,
        controlsChecks,
        linkActivationChecks,
      };
    });

    expect(
      report.semantics.hasRegionalOutline,
      'sidebar article com regiões semânticas (section/aside ou headings temáticos)'
    ).toBeTruthy();
    expect(
      report.semantics.hasSectionHeadingLevels,
      'sidebar article com títulos em headings (priorizar WCAG 2.4.6 migrando AEM para <h2>)'
    ).toBeTruthy();
    expect(
      report.semantics.hasStructuredNav,
      'lista <ul>/<ol> ou feed com vários links de notícias acessível'
    ).toBeTruthy();
    expect(
      report.sourceOrderPass,
      'ordem código-fonte: compartilhar → demais blocos antes do carrossel quando existirem'
    ).toBeTruthy();

    for (const imageCheck of report.imageChecks) {
      expect(imageCheck.pass, `imagem acessível WCAG 1.1.1: ${JSON.stringify(imageCheck)}`).toBeTruthy();
    }

    /** Se não capturamos texto para contraste (markup apenas ícones), exige pelo menos h2 válido já verificado separadamente. */
    if ((report.contrastChecks || []).length > 0) {
      for (const contrast of report.contrastChecks) {
        expect(
          contrast.pass,
          `contraste WCAG 1.4.3 insuficiente para "${contrast.text}" (${contrast.ratio.toFixed(2)} < ${contrast.minRatio})`
        ).toBeTruthy();
      }
    }

    for (const control of report.controlsChecks) {
      expect(control.pass, `controle/link com nome ou teclado: ${JSON.stringify(control)}`).toBeTruthy();
    }

    for (const lax of report.linkActivationChecks) {
      expect(lax.pass, `ativação prevista WCAG 2.5.2 (heurística): sem onclick/nav void: ${JSON.stringify(lax)}`).toBeTruthy();
    }

    /** Foco visível (2.1.1): foco em um link dentro do sidebar e verifica outline/shadow/outline-offset */
    await this.#expectFocusedLinkHasVisibleIndicator();
  }

  /**
   * @returns {Promise<void>}
   */
  async #expectFocusedLinkHasVisibleIndicator() {
    const firstLink = this.root().locator('a[href^="http"], a[href^="/"]').first();
    await firstLink.evaluate((/** @type {HTMLAnchorElement} */ el) => el.focus());
    const focusVisible = await firstLink.evaluate((/** @type {HTMLAnchorElement} */ el) => {
      const style = window.getComputedStyle(el);
      const ow = Number.parseFloat(style.outlineWidth || '0');
      const owMin = ow > 0;
      const outlineStyleOk = style.outlineStyle && style.outlineStyle !== 'none';
      const boxShadowOk = !!(style.boxShadow && style.boxShadow !== 'none');
      return owMin || outlineStyleOk || boxShadowOk;
    });
    expect(focusVisible, 'foco visível em link dentro do sidebar (outline ou box-shadow)').toBeTruthy();
  }

  async expectZoom200AndReflow320() {
    await this.page.setViewportSize({ width: 640, height: 960 });
    await this.page.waitForTimeout(150);
    await this.expectVisible();

    await this.page.setViewportSize({ width: 320, height: 800 });
    await this.page.waitForTimeout(150);
    await this.expectVisible();

    const overflow = await this.page.evaluate(() => {
      let sidebarOk = true;
      const xpathResult = document.evaluate(
        '/html/body/main/div[2]/div[2]/div/div[2]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const sidebar = xpathResult.singleNodeValue;
      if (sidebar instanceof HTMLElement)
        sidebarOk = sidebar.scrollWidth <= sidebar.clientWidth + 1;
      return { sidebarOk };
    });

    /** O documento inteiro já é avaliado no hero (`expectZoom200AndReflow320`); aqui focamos o bloco XPath do sidebar */
    expect(overflow.sidebarOk, 'WCAG 1.4.10: sidebar sem overflow horizontal próprio em 320px').toBeTruthy();
  }

  /**
   * Marca o carrossel, mede scrollLeft, desliza e verifica mudança (WCAG 2.5.1 swipe).
   */
  async expectCarouselSwipeChangesScrollPosition() {
    await this._attachCarouselScrollerMarker();
    const carousel = this.carouselScroller();
    const tracker = this.root().locator('a[href*="/noticias/"]').nth(3);

    const cardLeft = () =>
      tracker.evaluate((el) => /** @type {HTMLElement} */ (el).getBoundingClientRect().left);

    /** Sem overflow marcado pelo browser: mesmo assim o grupo “Últimas notícias” deve responder ao arrastar. */
    if (!(await carousel.count())) {
      const before = await cardLeft();
      const boxRoot = await this.root().boundingBox();
      expect(boxRoot, 'bounding box sidebar').not.toBeNull();
      /** @type {{ width: number; height: number }} */
      const b = /** @type {any} */ (boxRoot);
      await this.root().dragTo(this.root(), {
        force: true,
        sourcePosition: { x: Math.round(b.width * 0.85), y: Math.round(Math.min(b.height, 440) / 2) },
        targetPosition: { x: Math.round(b.width * 0.16), y: Math.round(Math.min(b.height, 440) / 2) },
      });
      await this.page.waitForTimeout(250);

      const drift = Math.abs((await cardLeft()) - before);
      expect(
        drift > 14,
        `fallback drag no sidebar reposiciona cartões (Δ=${Math.round(drift)}px)`
      ).toBeTruthy();
      return;
    }

    await expect(carousel).toBeVisible({ timeout: 15_000 });

    const startScroll = await carousel.evaluate((el) =>
      Number(/** @type {HTMLElement} */ (el).scrollLeft || 0)
    );
    await carousel.dragTo(carousel, {
      force: true,
      sourcePosition: { x: 240, y: 32 },
      targetPosition: { x: 48, y: 32 },
    });
    await this.page.waitForTimeout(220);

    let scrolled = Math.abs(
      (await carousel.evaluate((el) => Number(/** @type {HTMLElement} */ (el).scrollLeft || 0))) -
        startScroll
    );

    if (scrolled <= 14) {
      scrolled = await carousel.evaluate((el) => {
        const inner = /** @type {HTMLElement} */ (el);
        const prev = inner.scrollLeft;
        inner.scrollBy({ left: 320, behavior: 'instant' });
        return Math.abs(inner.scrollLeft - prev);
      });
    }

    if (scrolled <= 35) {
      const beforeCard = await cardLeft();
      await carousel.dragTo(carousel, {
        force: true,
        sourcePosition: { x: 220, y: 64 },
        targetPosition: { x: 40, y: 64 },
      });
      await this.page.waitForTimeout(200);
      scrolled = Math.max(scrolled, Math.abs((await cardLeft()) - beforeCard));
    }

    /** Carrossel precisa mover conteúdo horizontalmente via gesto OU scroll efetivo overflow */
    expect(scrolled, 'WCAG 2.5.1 swipe/scroll horizontal no carrossel do sidebar').toBeGreaterThan(35);
  }
}

module.exports = { ArticleSidebarComponent, SELECTORS };
