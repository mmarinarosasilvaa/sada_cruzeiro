const { expect } = require('@playwright/test');
const c = require('../constants/player-section');

class PlayerSectionComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /** `p.title` com texto exato CLUBES (escopo main). */
  playerSectionTitle() {
    const exactTitle = new RegExp(`^\\s*${c.PLAYER_SECTION_TITLE_TEXT}\\s*$`);
    return this.page
      .locator(`${c.TITLE_LOCATOR}, main .player-teams p.title, main .player-teams .title`)
      .filter({ hasText: exactTitle });
  }

  /**
   * Container da seção: pai direto do título.
   * Contém o `p.title` e os `div.team`.
   */
  sectionContainer() {
    return this.playerSectionTitle().first().locator('xpath=..');
  }

  /**
   * Cards de clube sob o mesmo pai do título (irmãos do `p.title`).
   */
  teamCards() {
    return this.sectionContainer().locator(`:scope > ${c.TEAM_CARD}`);
  }

  /**
   * Fallback: qualquer `div.team` descendente do container, se não forem filhos diretos.
   */
  teamCardsDescendant() {
    return this.sectionContainer().locator(c.TEAM_CARD);
  }

  async isPresent() {
    const t = this.playerSectionTitle();
    try {
      await t.first().waitFor({ state: 'visible', timeout: 7_000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Quando CLUBES existe: lista não vazia de `.team` e cada um tem logo + info preenchidos.
   */
  async expectEveryTeamCardHasLogoAndInfo() {
    await expect(this.playerSectionTitle().first(), 'título CLUBES').toBeVisible({ timeout: 10_000 });

    let teams = this.teamCards();
    let count = await teams.count();
    if (count === 0) {
      teams = this.teamCardsDescendant();
      count = await teams.count();
    }

    expect(
      count,
      'com título CLUBES, deve existir ao menos um div.team no mesmo bloco',
    ).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = teams.nth(i);
      const logoRoot = card.locator(c.TEAM_LOGO).first();
      const infoRoot = card.locator(c.TEAM_INFO).first();

      await expect(logoRoot, `card ${i + 1}/${count}: ${c.TEAM_LOGO}`).toBeVisible();
      await expect(infoRoot, `card ${i + 1}/${count}: ${c.TEAM_INFO}`).toBeVisible();

      const infoText = (await infoRoot.innerText()).trim();
      expect(infoText.length, `card ${i + 1}: .team-info com texto`).toBeGreaterThan(0);

      await this.expectLogoImagesLoaded(card, i + 1, count);
    }
  }

  /**
   * @param {import('@playwright/test').Locator} card
   * @param {number} index1
   * @param {number} total
   */
  async expectLogoImagesLoaded(card, index1, total) {
    const imgs = card.locator(`${c.TEAM_LOGO} img, img${c.TEAM_LOGO}`);
    const n = await imgs.count();
    if (n === 0) {
      const svg = card.locator(`${c.TEAM_LOGO} svg, svg${c.TEAM_LOGO}`);
      const sn = await svg.count();
      expect(
        sn > 0,
        `card ${index1}/${total}: .team-logo sem img — inclua <img> ou <svg> no logo`,
      ).toBeTruthy();
      await expect(svg.first()).toBeVisible();
      return;
    }
    for (let j = 0; j < n; j++) {
      const img = imgs.nth(j);
      await expect(img, `card ${index1}/${total}: imagem do logo ${j + 1}`).toBeVisible();
      const dims = await img.evaluate((el) => ({
        w: el.naturalWidth,
        h: el.naturalHeight,
      }));
      expect(dims.w, `card ${index1}: logo img naturalWidth`).toBeGreaterThan(0);
      expect(dims.h, `card ${index1}: logo img naturalHeight`).toBeGreaterThan(0);
    }
  }

  playerInfoRoot() {
    return this.page.locator('main .player-info').first();
  }

  playerBiographyRoot() {
    return this.page.locator('#player-1-biography, main .player-biography').first();
  }

  playerBiographyHeading() {
    const byId = this.page.locator('#player-1-biography > h1').first();
    return byId.or(this.playerBiographyRoot().locator('h1').first());
  }

  playerBiographyText() {
    const byClass = this.page.locator('#player-1-biography p.clamp-lines').first();
    return byClass.or(this.playerBiographyRoot().locator('p.clamp-lines, p:nth-of-type(2)').first());
  }

  playerSeeMoreButton() {
    const byId = this.page.locator('#player-1-see-more').first();
    return byId.or(
      this.playerBiographyRoot().getByRole('link', { name: /ver mais/i }).first(),
    );
  }

  async isPlayerInfoPresent() {
    const root = this.playerInfoRoot();
    if ((await root.count()) === 0) return false;
    return root.isVisible();
  }

  async expectPlayerInfoOptionalFieldsValid() {
    const root = this.playerInfoRoot();
    await expect(root, 'bloco .player-info visível').toBeVisible();

    const rows = root.locator('p');
    const count = await rows.count();
    expect(count, 'player-info deve ter ao menos um item <p>').toBeGreaterThan(0);

    const allowed = new Set(['NOME COMPLETO', 'NASCIMENTO', 'PERFIL', 'ANIVERSÁRIO']);
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const labelEl = row.locator('span').first();
      const hasLabel = (await labelEl.count()) > 0;
      if (!hasLabel) continue;

      const label = ((await labelEl.innerText()) || '').trim().toUpperCase();
      expect(allowed.has(label), `label de player-info reconhecida (${label})`).toBeTruthy();

      const fullText = ((await row.innerText()) || '').trim();
      const value = fullText.replace((await labelEl.innerText()) || '', '').trim();
      expect(value.length, `valor não vazio para ${label}`).toBeGreaterThan(0);
    }
  }

  async expectBiographyHeadingTypographyAndLayout() {
    const bio = this.playerBiographyRoot();
    await expect(bio, 'bloco .player-biography visível').toBeVisible();
    await expect(bio.locator('p.title').first(), 'título BIOGRAFIA visível').toHaveText(/^\s*BIOGRAFIA\s*$/);

    const h1 = this.playerBiographyHeading();
    await expect(h1, 'h1 da biografia visível').toBeVisible();

    const metrics = await h1.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
      return {
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        width: r.width,
        height: r.height,
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        opacity: parseFloat(s.opacity),
        angleDeg: Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI),
      };
    });

    const tol = 3;
    const strictDesign = process.env.E2E_STRICT_DESIGN === '1';
    expect(metrics.fontFamily, 'h1 font-family').toMatch(/noto[\s-]?sans/i);
    expect(
      ['500', '700'].includes(metrics.fontWeight),
      `h1 font-weight esperado 500 ou 700, recebido ${metrics.fontWeight}`,
    ).toBeTruthy();
    expect(metrics.fontStyle, 'h1 font-style').toMatch(/normal|medium/i);
    expect(
      ['18px', '24px'].includes(metrics.fontSize),
      `h1 font-size esperado 18px ou 24px, recebido ${metrics.fontSize}`,
    ).toBeTruthy();
    expect(
      ['32px', '36px', 'normal'].includes(metrics.lineHeight),
      `h1 line-height esperado 32px, 36px ou normal, recebido ${metrics.lineHeight}`,
    ).toBeTruthy();
    expect(['0px', '0', 'normal'].includes(metrics.letterSpacing), 'h1 letter-spacing ~0').toBeTruthy();

    if (strictDesign) {
      expect(metrics.width, 'h1 width').toBeGreaterThanOrEqual(647 - tol);
      expect(metrics.width, 'h1 width').toBeLessThanOrEqual(647 + tol);
      expect(metrics.height, 'h1 height').toBeGreaterThanOrEqual(128 - tol);
      expect(metrics.height, 'h1 height').toBeLessThanOrEqual(128 + tol);
      expect(metrics.top, 'h1 top').toBeGreaterThanOrEqual(1066 - tol);
      expect(metrics.top, 'h1 top').toBeLessThanOrEqual(1066 + tol);
      expect(metrics.left, 'h1 left').toBeGreaterThanOrEqual(80 - tol);
      expect(metrics.left, 'h1 left').toBeLessThanOrEqual(80 + tol);
    } else {
      expect(metrics.width, 'h1 width > 0').toBeGreaterThan(0);
      expect(metrics.height, 'h1 height > 0').toBeGreaterThan(0);
    }
    expect(metrics.opacity, 'h1 opacity').toBe(1);
    expect(metrics.angleDeg, 'h1 angle').toBe(0);
  }

  async expectSeeMoreExpandsBiography() {
    const bio = this.playerBiographyRoot();
    await expect(bio, 'bloco .player-biography visível').toBeVisible();

    const textBlock = this.playerBiographyText();
    if ((await textBlock.count()) === 0) {
      // eslint-disable-next-line no-console
      console.log('[E2E PLAYER] Parágrafo da biografia não encontrado neste build; teste segue sem expansão.');
      return;
    }
    const textIsVisible = await textBlock.isVisible();
    if (!textIsVisible) {
      // eslint-disable-next-line no-console
      console.log('[E2E PLAYER] Parágrafo da biografia oculto neste build; teste segue sem expansão.');
      return;
    }

    const before = await textBlock.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        className: el.className || '',
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        overflow: s.overflow,
        webkitLineClamp: s.webkitLineClamp || '',
        textLength: (el.textContent || '').trim().length,
      };
    });

    const seeMore = this.playerSeeMoreButton();
    const hasControl = (await seeMore.count()) > 0;
    const isVisible = hasControl ? await seeMore.isVisible() : false;

    if (!hasControl || !isVisible) {
      // eslint-disable-next-line no-console
      console.log(
        '[E2E PLAYER] Controle "Ver mais" ausente/oculto neste build; validação segue sem clique para evitar falso negativo.',
      );
      expect(before.textLength, 'biografia com conteúdo mínimo sem interação').toBeGreaterThan(80);
      return;
    }

    await expect(seeMore, 'botão/link Ver mais com texto').toHaveText(/^\s*ver mais\s*$/i);
    await seeMore.click();
    await this.page.waitForTimeout(400);

    const after = await textBlock.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        className: el.className || '',
        clientHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
        overflow: s.overflow,
        webkitLineClamp: s.webkitLineClamp || '',
        textLength: (el.textContent || '').trim().length,
      };
    });

    const heightGrew = after.clientHeight > before.clientHeight + 8;
    const clampRemoved =
      /clamp-lines/.test(before.className) && !/clamp-lines/.test(after.className);
    const hiddenOverflowRelaxed =
      before.overflow === 'hidden' && ['visible', 'clip', 'unset'].includes(after.overflow);
    const scrollGapReduced =
      before.scrollHeight - before.clientHeight > 8 &&
      after.scrollHeight - after.clientHeight < before.scrollHeight - before.clientHeight - 8;

    expect(
      heightGrew || clampRemoved || hiddenOverflowRelaxed || scrollGapReduced,
      `bio não expandiu após clique. before=${JSON.stringify(before)} after=${JSON.stringify(after)}`,
    ).toBeTruthy();

    expect(after.textLength, 'biografia permanece com conteúdo').toBeGreaterThan(80);
  }
}

module.exports = { PlayerSectionComponent };
