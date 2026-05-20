const { devices, test } = require('@playwright/test');
const { ArticlePage } = require('../page-objects/pages/ArticlePage');

test.describe('Article page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('hero article: componentes visíveis + snapshot de layout/tipografia informativo', async ({
    page,
  }) => {
    const articlePage = new ArticlePage(page);
    await articlePage.open();

    const hero = articlePage.hero();
    await hero.expectVisible();
    await hero.logDesignSnapshot();
  });

  test('hero article: valida acessibilidade WCAG no bloco principal', async ({ page }) => {
    const articlePage = new ArticlePage(page);
    await articlePage.open();

    const hero = articlePage.hero();
    await hero.expectAccessibilityCompliance();
    await hero.expectZoom200AndReflow320();
  });

  test('article content: texto visível + snapshot de layout/tipografia informativo', async ({
    page,
  }) => {
    const articlePage = new ArticlePage(page);
    await articlePage.open();

    const content = articlePage.content();
    await content.expectVisible();
    await content.logDesignSnapshot();
  });

  test('sidebar article: valida acessibilidade WCAG no novo sidebar', async ({ page }) => {
    const articlePage = new ArticlePage(page);
    await articlePage.open();

    const sidebar = articlePage.sidebar();
    await sidebar.expectVisible();
    await sidebar.expectAccessibilityCompliance();
    await sidebar.expectZoom200AndReflow320();
  });

  /**
   * WCAG 2.5.2: ativação no up-event não é garantida apenas por Playwright —
   * o teste de links sem javascript:void/onclick cobre heurística básica (sidebar).
   * WCAG 2.5.1: carrossel mobile deve responder a gesto de arrastar/swipe horizontal.
   *
   * Por restrição do Playwright (`test.use` não pode em describe aninhado), o viewport
   * mobile é aplicado no próprio teste após o beforeEach do suite.
   */
  test('sidebar carrossel: swipe horizontal altera scroll (mobile)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Gestos touch/swipe apenas no projeto mobile');

    const v = devices['Pixel 5'].viewport;
    if (v?.width && v?.height) await page.setViewportSize({ width: v.width, height: v.height });

    const articlePage = new ArticlePage(page);
    await articlePage.open();

    const sidebar = articlePage.sidebar();
    await sidebar.expectVisible();
    await sidebar.expectCarouselSwipeChangesScrollPosition();
  });
});
