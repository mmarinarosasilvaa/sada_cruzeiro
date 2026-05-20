const { devices, test } = require('@playwright/test');
const { ElencoPage } = require('../page-objects/pages/ElencoPage');

function isChromiumDesktopBaseline(testInfo) {
  return testInfo.project.name === 'chromium';
}

test.describe('Elenco page', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile') {
      const viewport = devices['Pixel 5'].viewport;
      if (viewport?.width && viewport?.height) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      }
      return;
    }

    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Cast List: valida layout e acessibilidade no chromium', async ({ page }, testInfo) => {
    test.skip(
      !isChromiumDesktopBaseline(testInfo),
      'Baseline visual e acessibilidade estrita do Cast List mantidos no chromium desktop'
    );

    const elencoPage = new ElencoPage(page);
    await elencoPage.open();

    const castList = elencoPage.castList();
    await castList.expectCastListVisible();
    await castList.expectCastListLayout();
    await castList.expectCastListAccessibilityCompliance();
  });

  test('Cast List: responsividade e reflow em 320px cross-browser', async ({ page }) => {
    const elencoPage = new ElencoPage(page);
    await elencoPage.open();

    const castList = elencoPage.castList();
    await castList.expectCastListVisible();
    await castList.expectCastListZoom200AndReflow320();
  });

  test('Seleção de times: valida layout, tipografia e acessibilidade no chromium', async ({
    page,
  }, testInfo) => {
    test.skip(
      !isChromiumDesktopBaseline(testInfo),
      'Baseline visual e acessibilidade estrita da Seleção de times mantidos no chromium desktop'
    );

    const elencoPage = new ElencoPage(page);
    await elencoPage.open();

    const castList = elencoPage.castList();
    await castList.expectTeamSelectionVisible();
    await castList.expectTeamSelectionLayout();
    await castList.expectTeamSelectionTypography();
    await castList.expectTeamSelectionAccessibility();
  });

  test('Seleção de times: navegação e acessibilidade cross-browser', async ({ page }) => {
    const elencoPage = new ElencoPage(page);
    await elencoPage.open();

    const castList = elencoPage.castList();
    await castList.expectTeamSelectionVisible();
    await castList.expectTeamSelectionAccessibility();
  });
});
