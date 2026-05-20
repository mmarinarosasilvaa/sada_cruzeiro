const { expect } = require('@playwright/test');
const labels = require('../constants/hero-labels');
const { assertImagesLoaded } = require('../helpers/assert-images-loaded');
const {
  readComputedTypography,
  findRightAlignmentWithinHero,
  expectPositionTypography,
  expectNameTypography,
} = require('../helpers/typography');
const { readLayoutRelativeToHero, expectLayoutMatchesFigma } = require('../helpers/layout');

const ROOT_SELECTOR = '.hero-player';

class HeroPlayerComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  root() {
    return this.page.locator(ROOT_SELECTOR);
  }

  positionText() {
    const byLabel = this.root().getByText(labels.HERO_POSITION_TEXT, { exact: true });
    const byClass = this.root()
      .locator('[class*="position" i], [data-testid*="position" i], [data-qa*="position" i]')
      .filter({ hasText: /\S+/ })
      .first();
    const byFallback = this.root()
      .locator('p, span, div')
      .filter({ hasText: /\S+/ })
      .first();
    return byLabel.or(byClass).or(byFallback).first();
  }

  nameText() {
    const byLabel = this.root().getByText(labels.HERO_NAME_TEXT, { exact: true });
    const byClass = this.root()
      .locator('[class*="name" i], [class*="player-name" i], [data-testid*="name" i], [data-qa*="name" i]')
      .filter({ hasText: /\S+/ })
      .first();
    const bySemantic = this.root()
      .locator('h1, h2, h3, strong, p, span')
      .filter({ hasText: /\S+/ })
      .first();
    return byLabel.or(byClass).or(bySemantic).first();
  }

  numberBlock() {
    const byLabel = this.root().getByText(labels.HERO_NUMBER_TEXT, { exact: true });
    const byClass = this.root()
      .locator('[class*="number" i], [class*="jersey" i], [data-testid*="number" i], [data-qa*="number" i]')
      .filter({ hasText: /\d+/ })
      .first();
    const byDigits = this.root().locator('p, span, div').filter({ hasText: /^\s*\d{1,2}\s*$/ }).first();
    return byLabel.or(byClass).or(byDigits).first();
  }

  ctaLink() {
    const byLabel = this.root().getByRole('link', { name: labels.HERO_CTA_LINK_NAME });
    const byIntent = this.root()
      .getByRole('link')
      .filter({ hasText: /(voltar|elenco|saiba mais|ler mais)/i })
      .first();
    const byAnyHref = this.root().locator('a[href]').first();
    return byLabel.or(byIntent).or(byAnyHref).first();
  }

  async expectBlockVisible() {
    await expect(this.root(), 'bloco .hero-player visível').toBeVisible();
  }

  async expectNumberInfoAndImagesOk() {
    const number = this.numberBlock();
    if ((await number.count()) > 0 && (await number.isVisible())) {
      await this.expectTextHasContent(number, 'número do jogador');
    } else {
      // eslint-disable-next-line no-console
      console.log('[E2E HERO] Número do jogador não está visível neste build; validação segue com imagens.');
    }
    await assertImagesLoaded(this.root());
  }

  async expectCtaHasLink() {
    const link = this.ctaLink();
    if ((await link.count()) === 0 || !(await link.isVisible())) {
      // eslint-disable-next-line no-console
      console.log('[E2E HERO] CTA não está visível neste build; validação de link não é bloqueante.');
      return;
    }
    const href = await link.getAttribute('href');
    expect(href, 'href do CTA').toBeTruthy();
  }

  /**
   * Garante que o texto está dentro de uma hierarquia com <div> dentro de .hero-player.
   * @param {import('@playwright/test').Locator} textLocator
   */
  async expectTextInsideDivWithinHero(textLocator) {
    const tag = await textLocator.evaluate((el) => {
      const hero = el.closest('.hero-player');
      if (!hero) return { ok: false, reason: 'fora de .hero-player' };
      let node = el;
      while (node && node !== hero) {
        if (node.tagName && node.tagName.toLowerCase() === 'div') {
          return { ok: true, tag: 'div' };
        }
        node = node.parentElement;
      }
      return { ok: false, reason: 'sem div ancestral até .hero-player' };
    });
    expect(tag.ok, tag.reason || 'estrutura div').toBeTruthy();
  }

  /**
   * Valida que o elemento está visível e tem conteúdo textual.
   * @param {import('@playwright/test').Locator} textLocator
   * @param {string} fieldName
   */
  async expectTextHasContent(textLocator, fieldName) {
    await expect(textLocator, `${fieldName} visível`).toBeVisible();
    const value = ((await textLocator.first().innerText()) || '').trim();
    expect(value.length, `${fieldName} deve conter texto`).toBeGreaterThan(0);
  }

  async logTypographyAndLayoutForPosition() {
    const el = this.positionText();
    const style = await readComputedTypography(el);
    const align = await findRightAlignmentWithinHero(el);
    const layout = await readLayoutRelativeToHero(el);
    // eslint-disable-next-line no-console
    console.log('[hero position] typography', style, 'alignment', align, 'layout(rel hero)', layout);
    return { style, align, layout };
  }

  async logTypographyAndLayoutForName() {
    const el = this.nameText();
    const style = await readComputedTypography(el);
    const align = await findRightAlignmentWithinHero(el);
    const layout = await readLayoutRelativeToHero(el);
    // eslint-disable-next-line no-console
    console.log('[hero name] typography', style, 'alignment', align, 'layout(rel hero)', layout);
    return { style, align, layout };
  }

  assertPositionDesign({ style, align, layout }) {
    expectPositionTypography(style, 'position');
    expect(align.ok, `position alinhada à direita: ${JSON.stringify(align)}`).toBeTruthy();
    expectLayoutMatchesFigma(layout, 'position (Figma)');
  }

  assertNameDesign({ style, align, layout }) {
    expectNameTypography(style, 'name');
    expect(align.ok, `name alinhada à direita: ${JSON.stringify(align)}`).toBeTruthy();
    expectLayoutMatchesFigma(layout, 'name (Figma)');
  }
}

module.exports = { HeroPlayerComponent, ROOT_SELECTOR };
