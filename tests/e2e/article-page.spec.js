const { devices, test } = require('@playwright/test');
const { ArticlePage } = require('../page-objects/pages/ArticlePage');

test.describe('Página de Artigo', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ─── Conteúdo (AUT-ART-C) ─────────────────────────────────────────────────

  test.describe('Article — Conteúdo', () => {
    /** AUT-ART-C01: título presente e com ao menos 10 caracteres */
    test('AUT-ART-C01: título do artigo presente cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectTitlePresent();
    });

    /** AUT-ART-C02: data de publicação presente */
    test('AUT-ART-C02: data de publicação presente cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectPublicationDatePresent();
    });

    /** AUT-ART-C03: featured image com src válido */
    test('AUT-ART-C03: featured image com src válido cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectFeaturedImageHasSrc();
    });

    /** AUT-ART-C04: featured image com alt text descritivo (>= 5 chars) */
    test('AUT-ART-C04: featured image com alt text descritivo cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectFeaturedImageHasAltText();
    });

    /** AUT-ART-C05: artigo com ao menos 2 parágrafos */
    test('AUT-ART-C05: artigo com ao menos 2 parágrafos cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectArticleHasParagraphs();
    });
  });

  // ─── Compartilhamento Social (AUT-ART-S) ──────────────────────────────────

  test.describe('Article — Compartilhamento Social', () => {
    /** AUT-ART-S04: ao menos 3 botões de compartilhamento visíveis */
    test('AUT-ART-S04: ao menos 3 botões de compartilhamento visíveis cross-browser', async ({
      page,
    }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectShareButtonsVisible();
    });

    /** AUT-ART-S01: link do Facebook presente */
    test('AUT-ART-S01: link de compartilhamento Facebook presente cross-browser', async ({
      page,
    }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectFacebookShareLinkPresent();
    });

    /** AUT-ART-S02: link do Twitter/X presente */
    test('AUT-ART-S02: link de compartilhamento Twitter/X presente cross-browser', async ({
      page,
    }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectTwitterShareLinkPresent();
    });

    /** AUT-ART-S03: link do LinkedIn presente */
    test('AUT-ART-S03: link de compartilhamento LinkedIn presente cross-browser', async ({
      page,
    }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectLinkedInShareLinkPresent();
    });

    /** AUT-ART-S05: URLs de compartilhamento contêm a URL da página */
    test('AUT-ART-S05: URLs de compartilhamento contêm URL do artigo cross-browser', async ({
      page,
    }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectShareUrlsContainPageUrl();
    });

    /** AUT-ART-S06: ao menos 3 ícones de compartilhamento */
    test('AUT-ART-S06: ao menos 3 ícones de compartilhamento cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.sharing().expectShareIconsCount();
    });
  });

  // ─── Acessibilidade e Responsivo ───────────────────────────────────────────

  test.describe('Article — Acessibilidade e Responsivo', () => {
    test('hero article: acessibilidade WCAG no bloco principal no chromium', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Baseline de acessibilidade estrita no chromium desktop'
      );
      const p = new ArticlePage(page);
      await p.open();
      const hero = p.hero();
      await hero.expectAccessibilityCompliance();
      await hero.expectZoom200AndReflow320();
    });

    test('imagens do artigo com lazy loading cross-browser', async ({ page }) => {
      const p = new ArticlePage(page);
      await p.open();
      await p.hero().expectImagesLazyLoaded();
    });

    test('sidebar article: acessibilidade WCAG e reflow 320px', async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Baseline de acessibilidade do sidebar no chromium desktop'
      );
      const p = new ArticlePage(page);
      await p.open();
      const sidebar = p.sidebar();
      await sidebar.expectVisible();
      await sidebar.expectAccessibilityCompliance();
      await sidebar.expectZoom200AndReflow320();
    });

    test('sidebar carrossel: swipe horizontal altera scroll (mobile)', async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'Gestos touch/swipe apenas no projeto mobile');
      const v = devices['Pixel 5'].viewport;
      if (v?.width && v?.height) await page.setViewportSize({ width: v.width, height: v.height });
      const p = new ArticlePage(page);
      await p.open();
      const sidebar = p.sidebar();
      await sidebar.expectVisible();
      await sidebar.expectCarouselSwipeChangesScrollPosition();
    });

    test('hero article: componentes visíveis + snapshot de layout/tipografia', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Snapshot de design no chromium desktop'
      );
      const p = new ArticlePage(page);
      await p.open();
      const hero = p.hero();
      await hero.expectVisible();
      await hero.logDesignSnapshot();
    });

    test('article content: texto visível + snapshot de layout/tipografia', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Snapshot de design no chromium desktop'
      );
      const p = new ArticlePage(page);
      await p.open();
      const content = p.content();
      await content.expectVisible();
      await content.logDesignSnapshot();
    });
  });
});
