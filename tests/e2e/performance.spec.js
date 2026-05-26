const { test, expect } = require('@playwright/test');
const { getCarouselNewsPageUrl, getElencoPageUrl, getArticlePageUrl } = require('../page-objects/constants/urls');

async function measureLoadTime(page, url) {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
  return Date.now() - start;
}

async function countImagesInViewport(page) {
  return page.evaluate(() => {
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const images = [...document.querySelectorAll('img')];
    return images.filter((img) => {
      const r = img.getBoundingClientRect();
      return r.top < viewportH && r.bottom > 0 && r.left < viewportW && r.right > 0;
    }).length;
  });
}

async function countDomNodes(page) {
  return page.evaluate(() => document.querySelectorAll('*').length);
}

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ─── Página de Notícias ────────────────────────────────────────────────────

  test.describe('Página de Notícias', () => {
    /**
     * AUT-PERF-01: page load < 3 segundos
     * AUT-PERF-02: menos de 5 imagens carregadas no viewport inicial (lazy loading eficaz)
     */
    test('AUT-PERF-01 | AUT-PERF-02: load time < 3s e lazy loading reduz imagens no viewport', async ({
      page,
    }) => {
      const url = getCarouselNewsPageUrl();
      const loadMs = await measureLoadTime(page, url);
      expect(loadMs, `AUT-PERF-01: load time deve ser < 3000ms (atual: ${loadMs}ms)`).toBeLessThan(3000);

      const inViewport = await countImagesInViewport(page);
      expect(
        inViewport,
        `AUT-PERF-02: máximo 5 imagens visíveis no viewport inicial (atual: ${inViewport})`
      ).toBeLessThanOrEqual(5);
    });

    /** AUT-PERF-04: DOM com menos de 2000 nós */
    test('AUT-PERF-04: DOM com menos de 2000 nós', async ({ page }) => {
      await page.goto(getCarouselNewsPageUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
      const nodes = await countDomNodes(page);
      expect(nodes, `AUT-PERF-04: DOM deve ter < 2000 nós (atual: ${nodes})`).toBeLessThan(2000);
    });
  });

  // ─── Página de Elenco ──────────────────────────────────────────────────────

  test.describe('Página de Elenco', () => {
    test('AUT-PERF-01 | AUT-PERF-02: load time < 3s e lazy loading no elenco', async ({
      page,
    }) => {
      const url = getElencoPageUrl();
      const loadMs = await measureLoadTime(page, url);
      expect(loadMs, `AUT-PERF-01: load time deve ser < 3000ms (atual: ${loadMs}ms)`).toBeLessThan(3000);

      const inViewport = await countImagesInViewport(page);
      expect(
        inViewport,
        `AUT-PERF-02: máximo 5 imagens visíveis no viewport inicial (atual: ${inViewport})`
      ).toBeLessThanOrEqual(5);
    });

    test('AUT-PERF-04: DOM com menos de 2000 nós', async ({ page }) => {
      await page.goto(getElencoPageUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
      const nodes = await countDomNodes(page);
      expect(nodes, `AUT-PERF-04: DOM deve ter < 2000 nós (atual: ${nodes})`).toBeLessThan(2000);
    });
  });

  // ─── Página de Artigo ──────────────────────────────────────────────────────

  test.describe('Página de Artigo', () => {
    test('AUT-PERF-01 | AUT-PERF-02: load time < 3s e lazy loading no artigo', async ({
      page,
    }) => {
      const url = getArticlePageUrl();
      const loadMs = await measureLoadTime(page, url);
      expect(loadMs, `AUT-PERF-01: load time deve ser < 3000ms (atual: ${loadMs}ms)`).toBeLessThan(3000);

      const inViewport = await countImagesInViewport(page);
      expect(
        inViewport,
        `AUT-PERF-02: máximo 5 imagens visíveis no viewport inicial (atual: ${inViewport})`
      ).toBeLessThanOrEqual(5);
    });

    test('AUT-PERF-04: DOM com menos de 2000 nós', async ({ page }) => {
      await page.goto(getArticlePageUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
      const nodes = await countDomNodes(page);
      expect(nodes, `AUT-PERF-04: DOM deve ter < 2000 nós (atual: ${nodes})`).toBeLessThan(2000);
    });
  });
});
