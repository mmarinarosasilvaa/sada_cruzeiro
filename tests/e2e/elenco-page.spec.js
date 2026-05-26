const { devices, test } = require('@playwright/test');
const { ElencoPage } = require('../page-objects/pages/ElencoPage');

function isChromiumDesktop(testInfo) {
  return testInfo.project.name === 'chromium';
}

test.describe('Página de Elenco — Cast List', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      const viewport = devices['Pixel 5'].viewport;
      if (viewport?.width && viewport?.height)
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      return;
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ─── Filtros de Categoria (AUT-CL-F) ──────────────────────────────────────

  test.describe('Cast List — Filtros de Categoria', () => {
    /** AUT-CL-F01: abas de categoria visíveis (ao menos 1) */
    test('AUT-CL-F01: abas de categoria visíveis cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCategoryTabsVisible();
    });

    /** AUT-CL-F02: clique em aba muda conteúdo */
    test('AUT-CL-F02: clique em aba muda conteúdo no chromium', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Interação de filtro no chromium desktop');
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectTabClickChangesContent();
    });

    /** AUT-CL-F03: aba ativa com aria-selected ou classe selected */
    test('AUT-CL-F03: aba ativa tem aria-selected ou classe selected cross-browser', async ({
      page,
    }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectActiveTabHasAriaSelected();
    });

    /** AUT-CL-F04: cards da categoria selecionada existem */
    test('AUT-CL-F04: cards da categoria selecionada existem cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCategoryCardsExist();
    });

    /** AUT-CL-F05: Tab navega entre abas de categoria */
    test('AUT-CL-F05: Tab navega entre abas de categoria no chromium', async ({
      page,
    }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Navegação por teclado no chromium desktop');
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectKeyboardTabNavigatesTabs();
    });

    /** AUT-CL-F06: Arrow Left/Right alternam abas */
    test('AUT-CL-F06: Arrow keys ou Enter alternam abas no chromium', async ({
      page,
    }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Navegação por teclado no chromium desktop');
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectArrowKeysSwitchTabs();
    });
  });

  // ─── Cards de Jogadores (AUT-CL-C) ────────────────────────────────────────

  test.describe('Cast List — Cards de Jogadores', () => {
    /** AUT-CL-C01: imagens dos cards têm src válido */
    test('AUT-CL-C01: imagens dos cards com src válido cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCardImagesHaveSrc();
    });

    /** AUT-CL-C02: imagens dos cards têm alt text */
    test('AUT-CL-C02: alt text em imagens dos cards cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCardImagesHaveAltText();
    });

    /** AUT-CL-C03: número do jogador válido (1-2 dígitos, se presente) */
    test('AUT-CL-C03: número do jogador com formato válido cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCardNumbersValid();
    });

    /** AUT-CL-C04: posição do jogador não está vazia (se presente) */
    test('AUT-CL-C04: posição do jogador não está vazia cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      await p.castList().expectCardPositionsNotEmpty();
    });
  });

  // ─── Layout e Acessibilidade (baseline chromium) ───────────────────────────

  test.describe('Cast List — Layout e Acessibilidade', () => {
    test('layout e acessibilidade WCAG no chromium', async ({ page }, testInfo) => {
      test.skip(!isChromiumDesktop(testInfo), 'Baseline de acessibilidade no chromium desktop');
      const p = new ElencoPage(page);
      await p.open();
      const castList = p.castList();
      await castList.expectCastListVisible();
      await castList.expectCastListLayout();
      await castList.expectCastListAccessibilityCompliance();
    });

    test('responsividade e reflow 320px cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      const castList = p.castList();
      await castList.expectCastListVisible();
      await castList.expectCastListZoom200AndReflow320();
    });

    test('imagens dos cards com lazy loading cross-browser', async ({ page }) => {
      const p = new ElencoPage(page);
      await p.open();
      const castList = p.castList();
      await castList.expectCastListVisible();
      await castList.expectImagesLazyLoaded();
    });
  });
});
