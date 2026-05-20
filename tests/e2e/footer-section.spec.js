const { test } = require('@playwright/test');
const { PlayerPage } = require('../page-objects/pages/PlayerPage');

test.describe('Footer section: validacao estrita de tipografia e layout', () => {
  test('Rodape da pagina de jogador: titulo, item e copyright com design estrito', async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.open();

    const footer = playerPage.footerSection();
    await footer.expectFooterVisible();
    await footer.expectTopicTitleTypographyAndLayoutStrict();
    await footer.expectTopicItemTypographyAndLayoutStrict();
    await footer.expectCopyrightTypographyAndLayoutStrict();
  });
});
