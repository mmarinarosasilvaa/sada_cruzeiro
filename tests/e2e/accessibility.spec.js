const { test, expect } = require('@playwright/test');
const { getCarouselNewsPageUrl, getElencoPageUrl, getArticlePageUrl, getPlayerPageUrl } = require('../page-objects/constants/urls');

function buildA11yReport() {
  const normalizeText = (v) => (v || '').replace(/\s+/g, ' ').trim();
  const isVisible = (el) => {
    if (!el) return false;
    const s = window.getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' &&
      Number.parseFloat(s.opacity || '1') > 0 && r.width > 0 && r.height > 0;
  };
  const parseRgb = (v) => {
    if (!v) return null;
    const m = v.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const [r, g, b, a] = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
    return { r: Number.isFinite(r) ? r : 255, g: Number.isFinite(g) ? g : 255, b: Number.isFinite(b) ? b : 255, a: Number.isFinite(a) ? a : 1 };
  };
  const luminance = ({ r, g, b }) => {
    const lin = (n) => { const v = n / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const blend = (fg, bg) => ({ r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)), g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)), b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)) });
  const contrastRatio = (fg, bg) => { const l1 = luminance(fg); const l2 = luminance(bg); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const getOpaqueBg = (el) => { let cur = el; while (cur) { const p = parseRgb(window.getComputedStyle(cur).backgroundColor); if (p && p.a > 0) return p; cur = cur.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; };

  // AUT-A11Y-01: alt text em imagens
  const imageChecks = [...document.querySelectorAll('img')].filter(isVisible).map((img) => {
    const alt = (img.getAttribute('alt') || '').trim();
    const ariaHidden = img.getAttribute('aria-hidden') === 'true';
    const generic = alt.toLowerCase() === 'image';
    return { alt, pass: ariaHidden || (alt.length > 0 && !generic) };
  });

  // AUT-A11Y-02: semântica HTML
  const semanticEls = [...document.querySelectorAll('h1,h2,h3,article,nav,main,section,aside')];
  const semanticCount = semanticEls.length;

  // AUT-A11Y-03: contraste
  const textEls = [...document.querySelectorAll('h1,h2,h3,p,a,button,li,span')].filter(isVisible).slice(0, 30);
  const contrastChecks = textEls.filter((el) => normalizeText(el.textContent).length > 0).map((el) => {
    const s = window.getComputedStyle(el);
    const fs = Number.parseFloat(s.fontSize || '16');
    const fw = Number.parseInt(s.fontWeight || '400', 10);
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const minRatio = large ? 3 : 4.5;
    const fg = parseRgb(s.color) || { r: 0, g: 0, b: 0, a: 1 };
    const bg = getOpaqueBg(el);
    const fgFinal = fg.a < 1 ? blend(fg, bg) : fg;
    const ratio = contrastRatio(fgFinal, bg);
    return { text: normalizeText(el.textContent).slice(0, 60), ratio, minRatio, pass: ratio >= minRatio };
  });

  // AUT-A11Y-04: teclado — todos focusable
  const focusableEls = [...document.querySelectorAll("button, a[href], [role='button'], input, select, textarea, [tabindex]")].filter(isVisible);
  const keyboardChecks = focusableEls.slice(0, 20).map((el) => {
    const tabIndex = Number.parseInt(el.getAttribute('tabindex') || '0', 10);
    return { tag: el.tagName.toLowerCase(), pass: tabIndex !== -1 };
  });

  // AUT-A11Y-05: propósito do link
  const linkChecks = [...document.querySelectorAll('a[href]')].filter(isVisible).slice(0, 20).map((a) => {
    const text = normalizeText(a.textContent) || normalizeText(a.getAttribute('aria-label') || '') || normalizeText(a.querySelector('img')?.getAttribute('alt') || '');
    return { href: (a.getAttribute('href') || '').slice(0, 60), text: text.slice(0, 60), pass: text.length > 0 };
  });

  // AUT-A11Y-06: ARIA labels em botões e tabs
  const ariaEls = [...document.querySelectorAll("button[aria-label], [role='tab'], button")].filter(isVisible).slice(0, 20).map((el) => {
    const ariaLabel = (el.getAttribute('aria-label') || '').trim();
    const textContent = normalizeText(el.textContent);
    return { tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', pass: ariaLabel.length > 0 || textContent.length > 0 };
  });

  return { imageChecks, semanticCount, contrastChecks, keyboardChecks, linkChecks, ariaEls };
}

async function runA11yChecks(page, label) {
  const report = await page.evaluate(buildA11yReport);

  // AUT-A11Y-01
  for (const img of report.imageChecks) {
    expect(img.pass, `AUT-A11Y-01 WCAG 1.1.1 [${label}]: imagem sem alt text: ${JSON.stringify(img)}`).toBeTruthy();
  }

  // AUT-A11Y-02
  expect(
    report.semanticCount,
    `AUT-A11Y-02 WCAG 1.3.1 [${label}]: deve ter ao menos 2 elementos semânticos (atual: ${report.semanticCount})`
  ).toBeGreaterThanOrEqual(2);

  // AUT-A11Y-03
  for (const c of report.contrastChecks) {
    expect(c.pass, `AUT-A11Y-03 WCAG 1.4.3 [${label}]: contraste insuficiente "${c.text}" (${c.ratio.toFixed(2)} < ${c.minRatio})`).toBeTruthy();
  }

  // AUT-A11Y-04
  for (const el of report.keyboardChecks) {
    expect(el.pass, `AUT-A11Y-04 WCAG 2.1.1 [${label}]: elemento não alcançável por teclado: ${JSON.stringify(el)}`).toBeTruthy();
  }

  // AUT-A11Y-05
  for (const link of report.linkChecks) {
    expect(link.pass, `AUT-A11Y-05 WCAG 2.4.4 [${label}]: link sem texto acessível: ${JSON.stringify(link)}`).toBeTruthy();
  }

  // AUT-A11Y-06
  for (const el of report.ariaEls) {
    expect(el.pass, `AUT-A11Y-06 WCAG 4.1.2 [${label}]: botão/tab sem label acessível: ${JSON.stringify(el)}`).toBeTruthy();
  }
}

test.describe('Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Página de Notícias', () => {
    test('AUT-A11Y-01 a AUT-A11Y-06: conformidade WCAG na Página de Notícias', async ({ page }) => {
      await page.goto(getCarouselNewsPageUrl(), { waitUntil: 'load', timeout: 90_000 });
      await runA11yChecks(page, 'Notícias');
    });
  });

  test.describe('Página de Elenco', () => {
    test('AUT-A11Y-01 a AUT-A11Y-06: conformidade WCAG na Página de Elenco', async ({ page }) => {
      await page.goto(getElencoPageUrl(), { waitUntil: 'load', timeout: 90_000 });
      await runA11yChecks(page, 'Elenco');
    });
  });

  test.describe('Página de Artigo', () => {
    test('AUT-A11Y-01 a AUT-A11Y-06: conformidade WCAG na Página de Artigo', async ({ page }) => {
      await page.goto(getArticlePageUrl(), { waitUntil: 'load', timeout: 90_000 });
      await runA11yChecks(page, 'Artigo');
    });
  });

  test.describe('Página do Jogador', () => {
    test('AUT-A11Y-01 a AUT-A11Y-06: conformidade WCAG na Página do Jogador', async ({ page }) => {
      await page.goto(getPlayerPageUrl(), { waitUntil: 'load', timeout: 90_000 });
      await runA11yChecks(page, 'Jogador');
    });
  });
});
