const { test } = require('@playwright/test');
const { PlayerPage } = require('../page-objects/pages/PlayerPage');

const STRICT_DESIGN = process.env.E2E_STRICT_DESIGN === '1';
const REQUIRE_PLAYER_SECTION = process.env.E2E_REQUIRE_PLAYER_SECTION === '1';

test.describe('Página do Jogador', () => {
  // ─── Hero Player ───────────────────────────────────────────────────────────

  test.describe('Hero Player', () => {
    test('bloco Hero Player carrega', async ({ page }) => {
      const player = new PlayerPage(page);
      await player.open();
      await player.heroPlayer().expectBlockVisible();
    });

    /** AUT-CL-C01 (Player): imagem do jogador carrega sem falhas */
    test('AUT-CL-C01: número, info e imagens carregam sem falhas cross-browser', async ({
      page,
    }) => {
      const player = new PlayerPage(page);
      await player.open();
      await player.heroPlayer().expectNumberInfoAndImagesOk();
    });

    test('botão/área do CTA exibe link', async ({ page }) => {
      const player = new PlayerPage(page);
      await player.open();
      await player.heroPlayer().expectCtaHasLink();
    });

    test('position: conteúdo, estrutura e tipografia', async ({ page }, testInfo) => {
      const player = new PlayerPage(page);
      await player.open();
      const hero = player.heroPlayer();
      const strictDesign = STRICT_DESIGN && testInfo.project.name !== 'firefox';

      const pos = hero.positionText();
      await hero.expectTextHasContent(pos, 'position');
      await hero.expectTextInsideDivWithinHero(pos);

      const snapshot = await hero.logTypographyAndLayoutForPosition();
      if (strictDesign) {
        hero.assertPositionDesign(snapshot);
      } else {
        // eslint-disable-next-line no-console
        console.log('design estrito desativado — tipografia/layout da position não bloqueiam o teste.');
      }
    });

    test('name: conteúdo, estrutura e tipografia', async ({ page }, testInfo) => {
      const player = new PlayerPage(page);
      await player.open();
      const hero = player.heroPlayer();
      const strictDesign = STRICT_DESIGN && testInfo.project.name !== 'firefox';

      const name = hero.nameText();
      await hero.expectTextHasContent(name, 'name');
      await hero.expectTextInsideDivWithinHero(name);

      const snapshot = await hero.logTypographyAndLayoutForName();
      if (strictDesign) {
        hero.assertNameDesign(snapshot);
      } else {
        // eslint-disable-next-line no-console
        console.log('design estrito desativado — tipografia/layout do name não bloqueiam o teste.');
      }
    });
  });

  // ─── Player Section ────────────────────────────────────────────────────────

  test.describe('Player Section — Clubes, Informações e Biografia', () => {
    test('Clubes: cada card team exibe logo e informações (quando bloco presente)', async ({
      page,
    }, testInfo) => {
      // eslint-disable-next-line no-console
      console.log('[E2E PLAYER] Iniciado — procura p.title "CLUBES".');
      const player = new PlayerPage(page);
      await player.open();
      const section = player.playerSection();

      if (!(await section.isPresent())) {
        const msg = 'Seção Player (CLUBES) não visível nesta URL/build.';
        // eslint-disable-next-line no-console
        console.log(`[E2E PLAYER] ${msg}`);
        if (REQUIRE_PLAYER_SECTION) {
          throw new Error(`${msg} Defina E2E_REQUIRE_PLAYER_SECTION=1 apenas quando o bloco estiver publicado.`);
        }
        testInfo.skip(true, msg);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[E2E PLAYER] Seção encontrada — validando cards team...');
      await section.expectEveryTeamCardHasLogoAndInfo();
    });

    test('informações do jogador: campos opcionais válidos no bloco player-info', async ({
      page,
    }, testInfo) => {
      const player = new PlayerPage(page);
      await player.open();
      const section = player.playerSection();

      if (!(await section.isPlayerInfoPresent())) {
        testInfo.skip(true, 'Bloco .player-info não está presente nesta página.');
        return;
      }
      await section.expectPlayerInfoOptionalFieldsValid();
    });

    test('biografia: tipografia e layout do título H1', async ({ page }) => {
      const player = new PlayerPage(page);
      await player.open();
      await player.playerSection().expectBiographyHeadingTypographyAndLayout();
    });

    test('biografia: botão Ver mais expande todo o texto', async ({ page }) => {
      const player = new PlayerPage(page);
      await player.open();
      await player.playerSection().expectSeeMoreExpandsBiography();
    });
  });

  // ─── Footer ────────────────────────────────────────────────────────────────

  test.describe('Footer — Tipografia e Layout', () => {
    test('rodapé: título, item e copyright com design estrito', async ({ page }) => {
      const player = new PlayerPage(page);
      await player.open();
      const footer = player.footerSection();
      await footer.expectFooterVisible();
      await footer.expectTopicTitleTypographyAndLayoutStrict();
      await footer.expectTopicItemTypographyAndLayoutStrict();
      await footer.expectCopyrightTypographyAndLayoutStrict();
    });
  });
});
