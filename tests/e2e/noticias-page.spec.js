const { devices, test } = require('@playwright/test');
const { CarouselNewsPage } = require('../page-objects/pages/CarouselNewsPage');

function isChromiumDesktop(testInfo) {
  return testInfo.project.name === 'chromium';
}

test.describe('Página de Notícias — Carousel News', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      const viewport = devices['Pixel 5'].viewport;
      if (viewport?.width && viewport?.height)
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      return;
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ─── Renderização ──────────────────────────────────────────────────────────

  test.describe('Carousel News — Renderização', () => {
    /** AUT-CAR-R01: título da seção visível e não vazio */
    test('AUT-CAR-R01: título da seção visível', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Baseline de renderização no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectSectionTitleVisible();
    });

    /** AUT-CAR-R02: ao menos 1 card renderizado */
    test('AUT-CAR-R02: cards renderizados cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectCardsRendered();
    });

    /** AUT-CAR-R03: imagens dos cards com src válido */
    test('AUT-CAR-R03: imagens dos cards com src cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectCardImagesHaveSrc();
    });

    /** AUT-CAR-R04: todas as imagens com alt text */
    test('AUT-CAR-R04: alt text em imagens cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectImagesHaveAltText();
    });

    /** AUT-CAR-R05: lazy loading ativo */
    test('AUT-CAR-R05: lazy loading ativo cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectImagesLazyLoaded();
    });

    /** AUT-CAR-R06: links dos cards clicáveis */
    test('AUT-CAR-R06: links dos cards clicáveis cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectCardLinksClickable();
    });
  });

  // ─── Navegação ─────────────────────────────────────────────────────────────

  test.describe('Carousel News — Navegação', () => {
    /** AUT-CAR-001: seta "Próximo" visível no desktop */
    test('AUT-CAR-001: seta Próximo visível no desktop', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Baseline visual no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectNavArrowNextVisible();
    });

    /** AUT-CAR-002: clique na seta direita avança o card */
    test('AUT-CAR-002: seta direita avança card no chromium', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Interação de navegação no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectNextArrowAdvancesCard();
    });

    /** AUT-CAR-003: último card + seta direita volta ao primeiro (loop) */
    test('AUT-CAR-003: loop circular — último card volta ao primeiro no chromium', async ({
      page,
    }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Interação de loop no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectLastCardLoopsToFirst();
    });

    /** AUT-CAR-004: seta esquerda retrocede o card */
    test('AUT-CAR-004: seta esquerda retrocede card no chromium', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Interação de navegação no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectPrevArrowGoesBack();
    });

    /** AUT-CAR-005: marcadores/indicadores existem */
    test('AUT-CAR-005: marcadores de posição existem cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectIndicatorsExist();
    });

    /**
     * AUT-CAR-005 (completo): marcadores mudam a cada 4 cards.
     * Planilha: activeIndex % 4 == expected — grupos de 4 cards alteram o indicador ativo.
     * Navega diretamente sem esperar visibilidade do root (falha de BUG-001 tratada no component).
     */
    test('AUT-CAR-005: marcadores mudam a cada grupo de 4 cards no chromium', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Validação de grupo de 4 apenas no chromium desktop');
      const { CarouselNewsComponent } = require('../page-objects/components/CarouselNewsComponent');
      const { getCarouselNewsPageUrl } = require('../page-objects/constants/urls');
      await page.goto(getCarouselNewsPageUrl(), { waitUntil: 'load', timeout: 90_000 });
      await page.waitForTimeout(1500);
      await new CarouselNewsComponent(page).expectIndicatorsChangeEvery4Cards();
    });

    /**
     * AUT-CAR-006: Tab+Enter avança card
     * AUT-CAR-007: Shift+Tab+Enter retrocede card
     */
    test('AUT-CAR-006 | AUT-CAR-007: teclado Tab+Enter avança e retrocede card no chromium', async ({
      page,
    }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Navegação por teclado no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectKeyboardNavigation();
    });

    /** AUT-CAR-008: swipe esquerda no mobile avança card */
    test('AUT-CAR-008: swipe esquerda avança card no mobile', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'Swipe apenas no projeto mobile');
      const viewport = devices['Pixel 5'].viewport;
      if (viewport?.width && viewport?.height)
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectMobileSwipeAdvances();
    });
  });

  // ─── Responsivo ────────────────────────────────────────────────────────────

  test.describe('Carousel News — Responsivo', () => {
    /** AUT-CAR-RES01: setas visíveis >= 1200px */
    test('AUT-CAR-RES01: setas de navegação visíveis >= 1200px', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Baseline visual no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectDesktopArrowsVisible();
    });

    /** AUT-CAR-RES02: marcadores visíveis no desktop */
    test('AUT-CAR-RES02: marcadores visíveis no desktop', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Baseline visual no chromium desktop');
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectDesktopIndicatorsVisible();
    });

    /** AUT-CAR-RES03: setas ocultas no mobile <= 768px */
    test('AUT-CAR-RES03: setas de navegação ocultas no mobile <= 768px cross-browser', async ({
      page,
    }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectMobileArrowsHiddenOrAbsent();
    });

    /** AUT-CAR-RES04: área de swipe ativa no mobile */
    test('AUT-CAR-RES04: swipe ativo no mobile cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectMobileSwipeAreaActive();
    });

    /** AUT-CAR-RES05: sem overflow horizontal com zoom 200% */
    test('AUT-CAR-RES05: sem overflow horizontal no zoom 200% cross-browser', async ({ page }) => {
      const p = new CarouselNewsPage(page);
      await p.open();
      await p.carouselNews().expectNoOverflowAtZoom200();
    });
  });
});
