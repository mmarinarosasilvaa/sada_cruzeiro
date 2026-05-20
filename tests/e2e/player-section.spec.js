const { test } = require('@playwright/test');
const { PlayerPage } = require('../page-objects/pages/PlayerPage');

const REQUIRE_PLAYER_SECTION = process.env.E2E_REQUIRE_PLAYER_SECTION === '1';

test.describe('Player section: clubes, informacoes e biografia', () => {
  test('Clubes: quando titulo CLUBES estiver visivel, cada card team deve exibir logo e informacoes', async ({
    page,
  }, testInfo) => {
    // eslint-disable-next-line no-console
    console.log('[E2E PLAYER] Teste iniciado (abre a página do jogador e procura p.title "CLUBES").');

    const player = new PlayerPage(page);
    await player.open();

    const playerSection = player.playerSection();
    const present = await playerSection.isPresent();

    if (!present) {
      const msg =
        'Seção Player (main p.title com texto CLUBES) não está visível nesta URL/build.';
      // eslint-disable-next-line no-console
      console.log(
        `[E2E PLAYER] ${msg} -> Playwright marca o teste como skipped (não é falha).`,
      );
      // eslint-disable-next-line no-console
      console.log(
        '[E2E PLAYER] Para falhar sem o bloco: E2E_REQUIRE_PLAYER_SECTION=1. Variações de build podem ocultar esta seção.',
      );
      if (REQUIRE_PLAYER_SECTION) {
        throw new Error(`${msg} Defina apenas quando a página publicar o bloco, ou remova E2E_REQUIRE_PLAYER_SECTION.`);
      }
      testInfo.skip(true, msg);
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[E2E PLAYER] Seção encontrada - validando cards team...');
    await playerSection.expectEveryTeamCardHasLogoAndInfo();
  });

  test('Informacoes do jogador: valida os campos opcionais exibidos no bloco player-info', async ({
    page,
  }, testInfo) => {
    const player = new PlayerPage(page);
    await player.open();
    const playerSection = player.playerSection();

    if (!(await playerSection.isPlayerInfoPresent())) {
      testInfo.skip(true, 'Bloco .player-info não está presente nesta página.');
      return;
    }

    await playerSection.expectPlayerInfoOptionalFieldsValid();
  });

  test('Biografia do jogador: valida tipografia e layout do titulo principal H1', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.open();
    const playerSection = player.playerSection();
    await playerSection.expectBiographyHeadingTypographyAndLayout();
  });

  test('Biografia do jogador: botao Ver mais deve estar visivel e expandir todo o texto', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.open();
    const playerSection = player.playerSection();
    await playerSection.expectSeeMoreExpandsBiography();
  });
});
