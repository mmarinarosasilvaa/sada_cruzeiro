const { expect } = require('@playwright/test');
const { getElencoPageUrl } = require('../constants/urls');
const { CastListComponent } = require('../components/CastListComponent');

class ElencoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = getElencoPageUrl();
  }

  castList() {
    return new CastListComponent(this.page);
  }

  async open() {
    const response = await this.page.goto(this.url, { waitUntil: 'load', timeout: 90_000 });
    expect(response, `deve receber resposta HTTP ao abrir ${this.url}`).toBeTruthy();
    expect(response.status(), `status HTTP ao abrir ${this.url}`).toBeLessThan(400);

    await this.page.waitForLoadState('domcontentloaded');
    await this.castList().categoryList().waitFor({ state: 'visible', timeout: 60_000 });
    await this.castList().cards().first().waitFor({ state: 'visible', timeout: 60_000 });
  }
}

module.exports = { ElencoPage };
