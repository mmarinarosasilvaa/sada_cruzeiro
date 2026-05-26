const { expect } = require('@playwright/test');
const { getCarouselNewsPageUrl } = require('../constants/urls');
const { CarouselNewsComponent } = require('../components/CarouselNewsComponent');

class CarouselNewsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = getCarouselNewsPageUrl();
  }

  carouselNews() {
    return new CarouselNewsComponent(this.page);
  }

  async open() {
    const response = await this.page.goto(this.url, { waitUntil: 'load', timeout: 90_000 });
    expect(response, `deve receber resposta HTTP ao abrir ${this.url}`).toBeTruthy();
    expect(response.status(), `status HTTP ao abrir ${this.url}`).toBeLessThan(400);

    await this.page.waitForLoadState('domcontentloaded');
    await this.carouselNews().root().waitFor({ state: 'visible', timeout: 60_000 });
    await this.carouselNews().cards().first().waitFor({ state: 'visible', timeout: 60_000 });
  }
}

module.exports = { CarouselNewsPage };
