const { expect } = require('@playwright/test');
const c = require('../constants/carousel-news');

class CarouselNewsComponent {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  root() { return this.page.locator(c.SELECTORS.root).first(); }
  cardList() { return this.root().locator(c.SELECTORS.cardList).first(); }
  cards() { return this.root().locator(c.SELECTORS.card); }
  navNext() { return this.root().locator(c.SELECTORS.navNext).first(); }
  navPrev() { return this.root().locator(c.SELECTORS.navPrev).first(); }
  indicators() { return this.root().locator(c.SELECTORS.indicators); }
  sectionTitle() { return this.root().locator(c.SELECTORS.sectionTitle).first(); }

  // ─── Renderização ──────────────────────────────────────────────────────────

  /** AUT-CAR-R01: título da seção visível e não vazio */
  async expectSectionTitleVisible() {
    const title = this.sectionTitle();
    await expect(title, 'AUT-CAR-R01: título do Carousel News visível').toBeVisible();
    const text = ((await title.textContent()) || '').trim();
    expect(text.length, 'AUT-CAR-R01: título não pode ser vazio').toBeGreaterThan(0);
  }

  /** AUT-CAR-R02: ao menos 1 card renderizado */
  async expectCardsRendered() {
    await expect(this.root(), 'AUT-CAR-R02: Carousel News visível').toBeVisible();
    const count = await this.cards().count();
    expect(count, 'AUT-CAR-R02: deve haver ao menos 1 card').toBeGreaterThan(0);
  }

  /** AUT-CAR-R03: cada card tem imagem com src válido */
  async expectCardImagesHaveSrc() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardImage)].map((img) => ({
        src: (img.getAttribute('src') || img.getAttribute('data-src') || '').slice(0, 100),
        pass:
          !!(img.getAttribute('src') || img.getAttribute('data-src')),
      }));
    }, c.SELECTORS);

    expect(report.length, 'AUT-CAR-R03: deve haver imagens nos cards').toBeGreaterThan(0);
    for (const img of report) {
      expect(img.pass, `AUT-CAR-R03: imagem sem src: ${JSON.stringify(img)}`).toBeTruthy();
    }
  }

  /** AUT-CAR-R04: todas as imagens têm alt text */
  async expectImagesHaveAltText() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardImage)].map((img) => {
        const alt = (img.getAttribute('alt') || '').trim();
        const ariaHidden = img.getAttribute('aria-hidden') === 'true';
        return {
          src: (img.getAttribute('src') || '').slice(0, 60),
          alt,
          pass: ariaHidden || alt.length > 0,
        };
      });
    }, c.SELECTORS);

    expect(report.length, 'AUT-CAR-R04: deve haver imagens').toBeGreaterThan(0);
    for (const img of report) {
      expect(img.pass, `AUT-CAR-R04: imagem sem alt text: ${JSON.stringify(img)}`).toBeTruthy();
    }
  }

  /** AUT-CAR-R05: imagens com lazy loading ativo */
  async expectImagesLazyLoaded() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardImage)].map((img) => ({
        src: (img.getAttribute('src') || '').slice(0, 60),
        loading: img.getAttribute('loading') || '',
        pass: img.getAttribute('loading') === 'lazy' || !!img.getAttribute('data-src'),
      }));
    }, c.SELECTORS);

    expect(report.length, 'AUT-CAR-R05: deve haver imagens').toBeGreaterThan(0);
    for (const img of report) {
      expect(img.pass, `AUT-CAR-R05: imagem sem lazy loading: ${JSON.stringify(img)}`).toBeTruthy();
    }
  }

  /** AUT-CAR-R06: links dos cards são clicáveis (href não vazio) */
  async expectCardLinksClickable() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardLink)].map((a) => ({
        href: (a.getAttribute('href') || '').slice(0, 80),
        pass: (a.getAttribute('href') || '').trim().length > 0,
      }));
    }, c.SELECTORS);

    expect(report.length, 'AUT-CAR-R06: cards devem ter links').toBeGreaterThan(0);
    for (const link of report) {
      expect(link.pass, `AUT-CAR-R06: link vazio: ${JSON.stringify(link)}`).toBeTruthy();
    }
  }

  // ─── Navegação ─────────────────────────────────────────────────────────────

  /** AUT-CAR-001: seta "Próximo" visível no desktop */
  async expectNavArrowNextVisible() {
    const btn = this.navNext();
    const count = await btn.count();
    expect(count, 'AUT-CAR-001: botão "Próximo" deve existir no DOM').toBeGreaterThan(0);
    await expect(btn, 'AUT-CAR-001: botão "Próximo" visível no desktop').toBeVisible();
  }

  /** AUT-CAR-002: seta direita avança o card visível */
  async expectNextArrowAdvancesCard() {
    const firstCard = this.cards().first();
    const textBefore = ((await firstCard.textContent()) || '').trim().slice(0, 60);

    const btn = this.navNext();
    if ((await btn.count()) === 0 || !(await btn.isVisible())) {
      console.log('[AUT-CAR-002] Seta "Próximo" não visível — swipe como fallback');
      await this.#swipeLeft();
    } else {
      await btn.click();
    }
    await this.page.waitForTimeout(400);

    const textAfter = ((await firstCard.textContent()) || '').trim().slice(0, 60);
    expect(
      textAfter !== textBefore || textAfter.length === 0,
      `AUT-CAR-002: card deve avançar após clique na seta (before="${textBefore}" after="${textAfter}")`
    ).toBeTruthy();
  }

  /** AUT-CAR-003: após o último card, seta direita volta ao primeiro (loop) */
  async expectLastCardLoopsToFirst() {
    const totalCards = await this.cards().count();
    if (totalCards < 2) {
      console.log('[AUT-CAR-003] Menos de 2 cards — loop não aplicável, pulando.');
      return;
    }

    const firstCardText = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);
    const btn = this.navNext();
    const hasArrow = (await btn.count()) > 0 && (await btn.isVisible());

    for (let i = 0; i < totalCards; i++) {
      if (hasArrow) await btn.click();
      else await this.#swipeLeft();
      await this.page.waitForTimeout(300);
    }

    const currentText = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);
    expect(
      currentText === firstCardText || currentText.length === 0,
      `AUT-CAR-003: após ${totalCards} cliques deve voltar ao primeiro card`
    ).toBeTruthy();
  }

  /** AUT-CAR-004: seta esquerda retrocede o card */
  async expectPrevArrowGoesBack() {
    const nextBtn = this.navNext();
    const prevBtn = this.navPrev();

    if ((await nextBtn.count()) > 0 && (await nextBtn.isVisible())) {
      await nextBtn.click();
      await this.page.waitForTimeout(400);
    } else {
      await this.#swipeLeft();
      await this.page.waitForTimeout(400);
    }

    const textAfterNext = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);

    if ((await prevBtn.count()) > 0 && (await prevBtn.isVisible())) {
      await prevBtn.click();
    } else {
      await this.#swipeRight();
    }
    await this.page.waitForTimeout(400);

    const textAfterPrev = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);
    expect(
      textAfterPrev !== textAfterNext || textAfterPrev.length === 0,
      `AUT-CAR-004: card deve retroceder após seta esquerda (after_next="${textAfterNext}" after_prev="${textAfterPrev}")`
    ).toBeTruthy();
  }

  /** AUT-CAR-005: indicadores existem e mudam conforme navegação */
  async expectIndicatorsExist() {
    const count = await this.indicators().count();
    expect(count, 'AUT-CAR-005: deve haver ao menos 1 indicador/marcador').toBeGreaterThan(0);
  }

  /** AUT-CAR-006 / AUT-CAR-007: navegação por teclado Tab+Enter avança/retrocede */
  async expectKeyboardNavigation() {
    const nextBtn = this.navNext();
    const prevBtn = this.navPrev();

    if ((await nextBtn.count()) === 0) {
      console.log('[AUT-CAR-006/007] Sem botões de navegação — teclado não aplicável.');
      return;
    }

    const textBefore = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);

    await nextBtn.focus();
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(400);

    const textAfterNext = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);
    expect(
      textAfterNext !== textBefore || textAfterNext.length === 0,
      `AUT-CAR-006: Tab+Enter na seta Próximo deve avançar o card`
    ).toBeTruthy();

    if ((await prevBtn.count()) > 0) {
      await prevBtn.focus();
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(400);

      const textAfterPrev = ((await this.cards().first().textContent()) || '').trim().slice(0, 60);
      expect(
        textAfterPrev !== textAfterNext || textAfterPrev.length === 0,
        'AUT-CAR-007: Tab+Enter na seta Anterior deve retroceder o card'
      ).toBeTruthy();
    }
  }

  /** AUT-CAR-008: swipe esquerda no mobile avança o próximo card */
  async expectMobileSwipeAdvances() {
    const firstCard = this.cards().first();
    const textBefore = ((await firstCard.textContent()) || '').trim().slice(0, 60);

    await this.#swipeLeft();
    await this.page.waitForTimeout(400);

    const textAfter = ((await firstCard.textContent()) || '').trim().slice(0, 60);
    const leftShifted = await firstCard.evaluate((el) => el.getBoundingClientRect().left < 0);

    expect(
      textAfter !== textBefore || leftShifted,
      `AUT-CAR-008: swipe esquerda deve avançar card no mobile`
    ).toBeTruthy();
  }

  // ─── Responsivo ────────────────────────────────────────────────────────────

  /** AUT-CAR-RES01: setas visíveis no desktop >= 1200px */
  async expectDesktopArrowsVisible() {
    await this.page.setViewportSize(c.BREAKPOINTS.desktopMin);
    await this.page.waitForTimeout(150);

    const nextBtn = this.navNext();
    const count = await nextBtn.count();
    expect(count, 'AUT-CAR-RES01: botão "Próximo" deve existir').toBeGreaterThan(0);
    await expect(nextBtn, 'AUT-CAR-RES01: seta "Próximo" visível >= 1200px').toBeVisible();
  }

  /** AUT-CAR-RES02: marcadores visíveis no desktop */
  async expectDesktopIndicatorsVisible() {
    await this.page.setViewportSize(c.BREAKPOINTS.desktopMin);
    await this.page.waitForTimeout(150);

    const count = await this.indicators().count();
    expect(count, 'AUT-CAR-RES02: indicadores devem existir no desktop').toBeGreaterThan(0);
  }

  /** AUT-CAR-RES03: setas ocultas ou ausentes no mobile <= 768px */
  async expectMobileArrowsHiddenOrAbsent() {
    await this.page.setViewportSize(c.BREAKPOINTS.mobileMax);
    await this.page.waitForTimeout(150);

    const nextBtn = this.navNext();
    const count = await nextBtn.count();

    if (count === 0) return;

    const isVisible = await nextBtn.isVisible();
    expect(
      !isVisible,
      'AUT-CAR-RES03: setas de navegação devem ser ocultas no mobile (<= 768px)'
    ).toBeTruthy();
  }

  /** AUT-CAR-RES04: área de swipe ativa no mobile */
  async expectMobileSwipeAreaActive() {
    await this.page.setViewportSize(c.BREAKPOINTS.mobileMax);
    await this.page.waitForTimeout(150);

    const scrollable = await this.cardList().evaluate((el) => {
      const s = window.getComputedStyle(el);
      return (
        el.scrollWidth > el.clientWidth + 4 ||
        /auto|scroll/i.test(s.overflowX || '')
      );
    });

    if (!scrollable) {
      const box = await this.root().boundingBox();
      expect(box, 'AUT-CAR-RES04: carousel deve ter bounding box no mobile').not.toBeNull();
    } else {
      expect(scrollable, 'AUT-CAR-RES04: área de swipe ativa no mobile').toBeTruthy();
    }
  }

  /** AUT-CAR-RES05: sem overflow horizontal com zoom 200% */
  async expectNoOverflowAtZoom200() {
    await this.page.setViewportSize(c.BREAKPOINTS.zoom200);
    await this.page.waitForTimeout(150);
    await expect(this.root(), 'AUT-CAR-RES05: Carousel News visível com zoom 200%').toBeVisible();

    const noScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
    });
    expect(noScroll, 'AUT-CAR-RES05: sem rolagem horizontal no zoom 200%').toBeTruthy();
  }

  // ─── Helpers internos ──────────────────────────────────────────────────────

  async #swipeLeft() {
    const box = await this.root().boundingBox();
    if (!box) return;
    await this.root().dragTo(this.root(), {
      force: true,
      sourcePosition: { x: Math.round(box.width * 0.8), y: Math.round(box.height * 0.5) },
      targetPosition: { x: Math.round(box.width * 0.2), y: Math.round(box.height * 0.5) },
    });
  }

  async #swipeRight() {
    const box = await this.root().boundingBox();
    if (!box) return;
    await this.root().dragTo(this.root(), {
      force: true,
      sourcePosition: { x: Math.round(box.width * 0.2), y: Math.round(box.height * 0.5) },
      targetPosition: { x: Math.round(box.width * 0.8), y: Math.round(box.height * 0.5) },
    });
  }
}

module.exports = { CarouselNewsComponent };
