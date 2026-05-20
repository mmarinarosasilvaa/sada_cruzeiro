const { expect } = require('@playwright/test');
const { getArticlePageUrl } = require('../constants/urls');
const { ArticleHeroComponent } = require('../components/ArticleHeroComponent');
const { ArticleContentComponent } = require('../components/ArticleContentComponent');
const { ArticleSidebarComponent } = require('../components/ArticleSidebarComponent');

class ArticlePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = getArticlePageUrl();
  }

  hero() {
    return new ArticleHeroComponent(this.page);
  }

  content() {
    return new ArticleContentComponent(this.page);
  }

  sidebar() {
    return new ArticleSidebarComponent(this.page);
  }

  async open() {
    const response = await this.page.goto(this.url, { waitUntil: 'load', timeout: 90_000 });
    expect(response, `deve receber resposta HTTP ao abrir ${this.url}`).toBeTruthy();
    expect(response.status(), `status HTTP ao abrir ${this.url}`).toBeLessThan(400);

    await this.page.waitForLoadState('domcontentloaded');
    await this.hero().title().waitFor({ state: 'visible', timeout: 60_000 });
  }
}

module.exports = { ArticlePage };
