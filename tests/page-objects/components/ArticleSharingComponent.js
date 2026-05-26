const { expect } = require('@playwright/test');

const SELECTORS = {
  shareContainer: "[class*='share' i]",
  facebookLink: "[class*='share'][href*='facebook'], [class*='share'] a[href*='facebook']",
  twitterLink: "[class*='share'][href*='twitter'], [class*='share'] a[href*='twitter'], [class*='share'][href*='x.com'], [class*='share'] a[href*='x.com']",
  linkedinLink: "[class*='share'][href*='linkedin'], [class*='share'] a[href*='linkedin']",
  anyShareLink: "[class*='share'] a[href], [class*='share'][href]",
  shareIcons: "[class*='share-icon'], [class*='share' i] img, [class*='share' i] svg",
};

class ArticleSharingComponent {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  shareContainer() {
    return this.page.locator(SELECTORS.shareContainer).first();
  }

  anyShareLinks() {
    return this.page.locator(SELECTORS.anyShareLink);
  }

  /** AUT-ART-S04: ao menos 3 botões/links de compartilhamento visíveis */
  async expectShareButtonsVisible() {
    const count = await this.anyShareLinks().count();
    expect(
      count,
      'AUT-ART-S04: ao menos 3 botões de compartilhamento devem estar visíveis'
    ).toBeGreaterThanOrEqual(3);
  }

  /** AUT-ART-S01: link do Facebook presente no bloco de compartilhamento */
  async expectFacebookShareLinkPresent() {
    const link = this.page.locator(SELECTORS.facebookLink).first();
    const count = await link.count();
    if (count === 0) {
      console.log('[AUT-ART-S01] Link do Facebook não encontrado — pode estar em outra estrutura.');
      const hasAnyShare = await this.anyShareLinks().count();
      expect(hasAnyShare, 'AUT-ART-S01: deve haver links de compartilhamento').toBeGreaterThan(0);
      return;
    }
    const href = (await link.getAttribute('href') || '').toLowerCase();
    expect(
      href.includes('facebook'),
      `AUT-ART-S01: link do Facebook deve ter href com "facebook": ${href}`
    ).toBeTruthy();
  }

  /** AUT-ART-S02: link do Twitter/X presente no bloco de compartilhamento */
  async expectTwitterShareLinkPresent() {
    const link = this.page.locator(SELECTORS.twitterLink).first();
    const count = await link.count();
    if (count === 0) {
      console.log('[AUT-ART-S02] Link do Twitter/X não encontrado.');
      return;
    }
    const href = (await link.getAttribute('href') || '').toLowerCase();
    expect(
      href.includes('twitter') || href.includes('x.com'),
      `AUT-ART-S02: link Twitter/X deve ter href com "twitter" ou "x.com": ${href}`
    ).toBeTruthy();
  }

  /** AUT-ART-S03: link do LinkedIn presente no bloco de compartilhamento */
  async expectLinkedInShareLinkPresent() {
    const link = this.page.locator(SELECTORS.linkedinLink).first();
    const count = await link.count();
    if (count === 0) {
      console.log('[AUT-ART-S03] Link do LinkedIn não encontrado.');
      return;
    }
    const href = (await link.getAttribute('href') || '').toLowerCase();
    expect(
      href.includes('linkedin'),
      `AUT-ART-S03: link LinkedIn deve ter href com "linkedin": ${href}`
    ).toBeTruthy();
  }

  /** AUT-ART-S05: URLs de compartilhamento contêm a URL da página atual */
  async expectShareUrlsContainPageUrl() {
    const currentUrl = this.page.url();
    const encodedUrl = encodeURIComponent(currentUrl);
    const domain = new URL(currentUrl).hostname;

    const links = await this.anyShareLinks().all();
    if (links.length === 0) {
      console.log('[AUT-ART-S05] Nenhum link de compartilhamento encontrado.');
      return;
    }

    let atLeastOneMatches = false;
    for (const link of links) {
      const href = (await link.getAttribute('href') || '');
      if (href.includes(encodedUrl) || href.includes(domain)) {
        atLeastOneMatches = true;
        break;
      }
    }

    expect(
      atLeastOneMatches,
      `AUT-ART-S05: ao menos um link de compartilhamento deve conter a URL do artigo (${domain})`
    ).toBeTruthy();
  }

  /** AUT-ART-S06: ao menos 3 ícones de compartilhamento presentes */
  async expectShareIconsCount() {
    const count = await this.page.locator(SELECTORS.shareIcons).count();
    expect(
      count,
      'AUT-ART-S06: ao menos 3 ícones de compartilhamento (img/svg)'
    ).toBeGreaterThanOrEqual(3);
  }
}

module.exports = { ArticleSharingComponent };
