const { test } = require('@playwright/test');
const { PlayerPage } = require('../page-objects/pages/PlayerPage');

const STRICT_DESIGN = process.env.E2E_STRICT_DESIGN === '1';

test.describe('Hero player', () => {
  test('bloco Hero player carrega', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.open();
    await player.heroPlayer().expectBlockVisible();
  });

  test('número, info e imagens carregam sem falhas', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.open();
    await player.heroPlayer().expectNumberInfoAndImagesOk();
  });

  test('botão/área do CTA exibe link', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.open();
    await player.heroPlayer().expectCtaHasLink();
  });

  test('position: conteúdo, estrutura em div, logs (design estrito opcional)', async ({ page }, testInfo) => {
    const player = new PlayerPage(page);
    await player.open();
    const hero = player.heroPlayer();
    const strictDesignForProject = STRICT_DESIGN && testInfo.project.name !== 'firefox';

    const pos = hero.positionText();
    await hero.expectTextHasContent(pos, 'position');
    await hero.expectTextInsideDivWithinHero(pos);

    const snapshot = await hero.logTypographyAndLayoutForPosition();
    if (strictDesignForProject) {
      hero.assertPositionDesign(snapshot);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        'design estrito desativado para este projeto — tipografia/layout/alinhamento da position não bloqueiam o teste.',
      );
    }
  });

  test('name: conteúdo, estrutura em div, logs (design estrito opcional)', async ({ page }, testInfo) => {
    const player = new PlayerPage(page);
    await player.open();
    const hero = player.heroPlayer();
    const strictDesignForProject = STRICT_DESIGN && testInfo.project.name !== 'firefox';

    const name = hero.nameText();
    await hero.expectTextHasContent(name, 'name');
    await hero.expectTextInsideDivWithinHero(name);

    const snapshot = await hero.logTypographyAndLayoutForName();
    if (strictDesignForProject) {
      hero.assertNameDesign(snapshot);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        'design estrito desativado para este projeto — tipografia/layout/alinhamento do name não bloqueiam o teste.',
      );
    }
  });
});
