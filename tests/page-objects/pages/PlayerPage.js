const { expect } = require('@playwright/test');
const { getPlayerPageUrl } = require('../constants/urls');
const { HeroPlayerComponent } = require('../components/HeroPlayerComponent');
const { PlayerSectionComponent } = require('../components/PlayerSectionComponent');
const { FooterSectionComponent } = require('../components/FooterSectionComponent');

class PlayerPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = getPlayerPageUrl();
  }

  heroPlayer() {
    return new HeroPlayerComponent(this.page);
  }

  playerSection() {
    return new PlayerSectionComponent(this.page);
  }

  footerSection() {
    return new FooterSectionComponent(this.page);
  }

  /**
   * Abre a página do jogador com diagnósticos e espera .hero-player visível.
   */
  async open() {
    const page = this.page;
    const url = this.url;

    const pageErrors = [];
    const consoleMessages = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleMessages.push(msg.text());
    });

    let response;
    try {
      response = await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
    } catch (e) {
      const msg = String(/** @type {Error} */ (e).message || e);
      if (/has been closed/i.test(msg)) {
        throw new Error(
          `${msg}\nDica: em modo headed, não feche a janela do navegador durante o teste; use --workers=1.`,
        );
      }
      throw e;
    }

    if (!response) {
      throw new Error(`Sem resposta HTTP ao abrir ${url} (response null).`);
    }
    const status = response.status();
    if (status >= 400) {
      throw new Error(`HTTP ${status} ao abrir ${url}`);
    }

    try {
      const body = await response.text();
      expect(body, 'HTML deve mencionar hero-player').toContain('hero-player');
    } catch (e) {
      // Firefox pode falhar ao ler response body em alguns builds (NS_ERROR_FAILURE).
      // Nesses casos seguimos para validação de DOM visível abaixo.
      // eslint-disable-next-line no-console
      console.log('[E2E PLAYER] Falha ao ler response.text(); seguindo com validação por DOM.', String(e));
    }

    try {
      await page.waitForLoadState('networkidle', { timeout: 30_000 });
    } catch {
      /* AEM pode manter conexões abertas */
    }

    const hero = page.locator('.hero-player');
    try {
      await hero.waitFor({ state: 'visible', timeout: 60_000 });
    } catch {
      const currentUrl = page.url();
      const errDetail = {
        url: currentUrl,
        pageErrors,
        consoleErrors: consoleMessages,
      };
      throw new Error(
        `.hero-player não ficou visível em ${currentUrl}. Diagnóstico: ${JSON.stringify(errDetail, null, 2)}`,
      );
    }
  }
}

module.exports = { PlayerPage };
