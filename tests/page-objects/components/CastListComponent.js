const { expect } = require('@playwright/test');
const c = require('../constants/elenco');
const {
  readComputedTypography,
  lineHeightIs100Percent,
  letterSpacingIsZero,
} = require('../helpers/typography');

class CastListComponent {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  root() {
    return this.page.locator(c.SELECTORS.root).first();
  }

  teamRoster() {
    return this.root().locator(c.SELECTORS.teamRoster).first();
  }

  headerTitle() {
    return this.root().locator(c.SELECTORS.headerTitle).first();
  }

  categoryList() {
    return this.root().locator(c.SELECTORS.categoryList).first();
  }

  categoryButtons() {
    return this.root().locator(c.SELECTORS.categoryButtons);
  }

  cardsGrid() {
    return this.root().locator(c.SELECTORS.cardsGrid).first();
  }

  cards() {
    return this.root().locator(c.SELECTORS.card);
  }

  /** TC-IMAGE-001: imagens dos cards com lazy loading ativo */
  async expectImagesLazyLoaded() {
    const report = await this.root().evaluate((root, selectors) => {
      const images = [
        ...root.querySelectorAll(`${selectors.cardPrimaryImage}, ${selectors.cardHoverImage}`),
      ];
      return images.map((img) => ({
        src: (img.getAttribute('src') || img.getAttribute('data-src') || '').slice(0, 80),
        loading: img.getAttribute('loading') || '',
        pass: img.getAttribute('loading') === 'lazy' || !!img.getAttribute('data-src'),
      }));
    }, c.SELECTORS);

    expect(report.length, 'Cast List deve ter imagens nos cards').toBeGreaterThan(0);
    for (const img of report) {
      expect(
        img.pass,
        `TC-IMAGE-001: imagem do Cast List deve ter lazy loading: ${JSON.stringify(img)}`
      ).toBeTruthy();
    }
  }

  // ─── Filtros de Categoria (AUT-CL-F) ──────────────────────────────────────

  /** AUT-CL-F01: abas de categoria visíveis (ao menos 1) */
  async expectCategoryTabsVisible() {
    const tabs = this.root().locator(c.SELECTORS.categoryTabs);
    const count = await tabs.count();
    expect(count, 'AUT-CL-F01: deve haver ao menos 1 aba de categoria').toBeGreaterThan(0);
    await expect(tabs.first(), 'AUT-CL-F01: primeira aba visível').toBeVisible();
  }

  /** AUT-CL-F02: clique em aba muda o conteúdo exibido */
  async expectTabClickChangesContent() {
    const tabs = this.root().locator(c.SELECTORS.categoryTabs);
    const count = await tabs.count();
    if (count < 2) {
      console.log('[AUT-CL-F02] Menos de 2 abas — mudança de conteúdo não aplicável.');
      return;
    }

    const contentBefore = ((await this.cardsGrid().textContent()) || '').trim().slice(0, 200);
    await tabs.nth(1).click();
    await this.page.waitForTimeout(400);

    const contentAfter = ((await this.cardsGrid().textContent()) || '').trim().slice(0, 200);
    expect(
      contentAfter !== contentBefore,
      'AUT-CL-F02: conteúdo deve mudar após clicar em aba diferente'
    ).toBeTruthy();
  }

  /** AUT-CL-F03: aba ativa tem aria-selected='true' ou classe 'selected' */
  async expectActiveTabHasAriaSelected() {
    const activeTab = this.root().locator(c.SELECTORS.activeTab).first();
    const count = await activeTab.count();

    if (count > 0) {
      await expect(activeTab, 'AUT-CL-F03: aba ativa visível').toBeVisible();
    } else {
      const tabs = this.root().locator(c.SELECTORS.categoryTabs);
      const firstSelected = await tabs.first().evaluate(
        (el) => el.classList.contains('selected') || el.getAttribute('aria-selected') === 'true'
      );
      expect(firstSelected, 'AUT-CL-F03: primeira aba deve iniciar selecionada').toBeTruthy();
    }
  }

  /** AUT-CL-F04: cards da categoria selecionada existem (count > 0) */
  async expectCategoryCardsExist() {
    const count = await this.cards().count();
    expect(count, 'AUT-CL-F04: categoria deve ter ao menos 1 card').toBeGreaterThan(0);
  }

  /** AUT-CL-F05: Tab navega entre abas de categoria */
  async expectKeyboardTabNavigatesTabs() {
    const tabs = this.root().locator(c.SELECTORS.categoryTabs);
    if ((await tabs.count()) < 2) return;

    await this.page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });

    const firstTab = tabs.first();
    await firstTab.focus();
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(100);

    const secondFocused = await tabs.nth(1).evaluate(
      (el) => el === document.activeElement || el.contains(document.activeElement)
    );
    expect(secondFocused, 'AUT-CL-F05: Tab deve mover foco para a próxima aba').toBeTruthy();
  }

  /** AUT-CL-F06: teclas Arrow Right/Left alternam entre abas */
  async expectArrowKeysSwitchTabs() {
    const tabs = this.root().locator(c.SELECTORS.categoryTabs);
    if ((await tabs.count()) < 2) return;

    await tabs.first().focus();
    const supportsArrow = await tabs.first().evaluate((el) => {
      return el.getAttribute('role') === 'tab' || el.tagName.toLowerCase() === 'button';
    });

    if (!supportsArrow) {
      console.log('[AUT-CL-F06] Elemento não suporta arrow keys — usando Enter como fallback.');
      await tabs.nth(1).focus();
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(300);
      const selected = await tabs.nth(1).evaluate(
        (el) => el.classList.contains('selected') || el.getAttribute('aria-selected') === 'true'
      );
      expect(selected, 'AUT-CL-F06 fallback: Enter seleciona aba').toBeTruthy();
      return;
    }

    await this.page.keyboard.press('ArrowRight');
    await this.page.waitForTimeout(300);
    const secondActive = await tabs.nth(1).evaluate(
      (el) => el === document.activeElement || el.classList.contains('selected') || el.getAttribute('aria-selected') === 'true'
    );
    expect(secondActive, 'AUT-CL-F06: ArrowRight deve ativar a aba seguinte').toBeTruthy();
  }

  // ─── Cards de Jogadores (AUT-CL-C) ────────────────────────────────────────

  /** AUT-CL-C01: imagens dos cards têm src válido */
  async expectCardImagesHaveSrc() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardPrimaryImage)].map((img) => ({
        src: (img.getAttribute('src') || img.getAttribute('data-src') || '').slice(0, 80),
        pass: !!(img.getAttribute('src') || img.getAttribute('data-src')),
      }));
    }, c.SELECTORS);

    expect(report.length, 'AUT-CL-C01: deve haver imagens nos cards').toBeGreaterThan(0);
    for (const img of report) {
      expect(img.pass, `AUT-CL-C01: imagem sem src: ${JSON.stringify(img)}`).toBeTruthy();
    }
  }

  /** AUT-CL-C02: imagens dos cards têm alt text */
  async expectCardImagesHaveAltText() {
    const report = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardPrimaryImage)].map((img) => {
        const alt = (img.getAttribute('alt') || '').trim();
        const ariaHidden = img.getAttribute('aria-hidden') === 'true';
        return {
          src: (img.getAttribute('src') || '').slice(0, 60),
          alt,
          pass: ariaHidden || alt.length > 0,
        };
      });
    }, c.SELECTORS);

    expect(report.length, 'AUT-CL-C02: deve haver imagens').toBeGreaterThan(0);
    for (const img of report) {
      expect(img.pass, `AUT-CL-C02: imagem sem alt text: ${JSON.stringify(img)}`).toBeTruthy();
    }
  }

  /** AUT-CL-C03: número do jogador (quando presente) é 1-2 dígitos */
  async expectCardNumbersValid() {
    const numbers = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardNumber)].map((el) => ({
        text: (el.textContent || '').trim(),
        pass: /^[0-9]{1,2}$/.test((el.textContent || '').trim()),
      }));
    }, c.SELECTORS);

    if (numbers.length === 0) {
      console.log('[AUT-CL-C03] Números dos jogadores não presentes nesta build — campo opcional.');
      return;
    }
    for (const num of numbers) {
      expect(
        num.pass,
        `AUT-CL-C03: número do jogador deve ser 1-2 dígitos: "${num.text}"`
      ).toBeTruthy();
    }
  }

  /** AUT-CL-C04: posição do jogador (quando presente) não está vazia */
  async expectCardPositionsNotEmpty() {
    const positions = await this.root().evaluate((root, selectors) => {
      return [...root.querySelectorAll(selectors.cardPosition)].map((el) => ({
        text: (el.textContent || '').trim(),
        pass: (el.textContent || '').trim().length > 0,
      }));
    }, c.SELECTORS);

    if (positions.length === 0) {
      console.log('[AUT-CL-C04] Posições dos jogadores não presentes nesta build — campo opcional.');
      return;
    }
    for (const pos of positions) {
      expect(pos.pass, `AUT-CL-C04: posição não pode ser vazia: ${JSON.stringify(pos)}`).toBeTruthy();
    }
  }

  async expectCastListVisible() {
    await expect(this.root(), 'Cast List visível').toBeVisible();
    await expect(this.teamRoster(), 'Cast List header visível').toBeVisible();
    await expect(this.cardsGrid(), 'grid do Cast List visível').toBeVisible();

    const count = await this.cards().count();
    expect(count, 'Cast List deve exibir ao menos um card').toBeGreaterThan(0);
  }

  async expectTeamSelectionVisible() {
    await expect(this.headerTitle(), 'título da categoria visível').toBeVisible();
    await expect(this.categoryList(), 'Seleção de times visível').toBeVisible();

    const buttons = this.categoryButtons();
    await expect(buttons, 'Seleção de times deve conter 3 botões').toHaveCount(
      c.TEXT.categoryButtons.length
    );
    await expect(buttons, 'Seleção de times deve preservar a ordem dos nomes').toHaveText(
      c.TEXT.categoryButtons
    );
    await expect(buttons.first(), 'primeira opção inicia selecionada').toHaveClass(/selected/);
  }

  async expectCastListLayout() {
    await this.#expectLayout(this.cardsGrid(), c.LAYOUT.castList, 'Cast List');
  }

  async expectTeamSelectionLayout() {
    await this.#expectLayout(this.categoryList(), c.LAYOUT.teamSelection, 'Seleção de times');
  }

  async expectTeamSelectionTypography() {
    await this.#expectDisplayTypography(this.headerTitle(), 'Seleção de times título');

    const buttons = this.categoryButtons();
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await this.#expectDisplayTypography(
        buttons.nth(i),
        `Seleção de times botão ${i + 1}/${count}`
      );
    }
  }

  async expectCastListAccessibilityCompliance() {
    const report = await this.root().evaluate(
      (root, selectors) => {
        const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const isVisible = (el) => {
          if (!el) return false;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            Number.parseFloat(style.opacity || '1') > 0 &&
            rect.width > 0 &&
            rect.height > 0
          );
        };

        const parseRgb = (value) => {
          if (!value) return null;
          const match = value.match(/rgba?\(([^)]+)\)/i);
          if (!match) return null;
          const [r, g, b, a] = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
          return {
            r: Number.isFinite(r) ? r : 255,
            g: Number.isFinite(g) ? g : 255,
            b: Number.isFinite(b) ? b : 255,
            a: Number.isFinite(a) ? a : 1,
          };
        };

        const luminance = ({ r, g, b }) => {
          const toLinear = (value) => {
            const n = value / 255;
            return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };

        const blend = (fg, bg) => ({
          r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
          g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
          b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
        });

        const contrastRatio = (fg, bg) => {
          const l1 = luminance(fg);
          const l2 = luminance(bg);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        };

        const getOpaqueBackground = (el) => {
          let current = el;
          while (current) {
            const parsed = parseRgb(window.getComputedStyle(current).backgroundColor);
            if (parsed && parsed.a > 0) return parsed;
            current = current.parentElement;
          }
          return { r: 255, g: 255, b: 255, a: 1 };
        };

        const titleEl = root.querySelector(selectors.headerTitle);
        const cardsGrid = root.querySelector(selectors.cardsGrid);
        const visibleCards = [...root.querySelectorAll(selectors.card)].filter(isVisible);
        const visibleTextElements = [
          ...new Set(
            [
              selectors.headerTitle,
              selectors.cardName,
              selectors.cardPosition,
              selectors.cardNumber,
            ].flatMap((selector) => [...root.querySelectorAll(selector)])
          ),
        ].filter(isVisible);

        const imageChecks = visibleCards.map((card) => {
          const name = normalizeText(card.querySelector(selectors.cardName)?.textContent || '');
          const primaryImage = card.querySelector(selectors.cardPrimaryImage);
          const hoverImage = card.querySelector(selectors.cardHoverImage);
          const primaryAlt = normalizeText(primaryImage?.getAttribute('alt') || '');
          const hoverAlt = normalizeText(hoverImage?.getAttribute('alt') || '');
          return {
            name,
            primaryAlt,
            hoverAlt,
            primaryPass: primaryAlt.length > 0,
            hoverPass: hoverAlt === `Foto de ${name} (hover)`,
          };
        });

        const liChildren = cardsGrid ? [...cardsGrid.children].filter(isVisible) : [];
        const semanticListPass =
          Boolean(cardsGrid) &&
          cardsGrid.tagName === 'UL' &&
          liChildren.length > 0 &&
          liChildren.every((child) => child.tagName === 'LI' && child.querySelector('a[href]'));

        const linkChecks = visibleCards.map((card) => {
          const visibleName = normalizeText(card.querySelector(selectors.cardName)?.textContent || '');
          const imageAlt = normalizeText(
            card.querySelector(selectors.cardPrimaryImage)?.getAttribute('alt') || ''
          );
          const accessibleName =
            normalizeText(card.getAttribute('aria-label') || '') ||
            normalizeText(card.getAttribute('title') || '') ||
            normalizeText(card.textContent || '') ||
            imageAlt;
          const href = normalizeText(card.getAttribute('href') || '');
          const tabIndex = Number.parseInt(card.getAttribute('tabindex') || '0', 10);
          return {
            visibleName,
            accessibleName,
            href,
            pass:
              visibleName.length > 0 &&
              accessibleName.toLowerCase().includes(visibleName.toLowerCase()) &&
              href.length > 0 &&
              tabIndex !== -1,
          };
        });

        const contrastChecks = visibleTextElements.map((el) => {
          const style = window.getComputedStyle(el);
          const fontSizePx = Number.parseFloat(style.fontSize || '16');
          const fontWeight = Number.parseInt(style.fontWeight || '400', 10);
          const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
          const minRatio = isLargeText ? 3 : 4.5;
          const fgParsed = parseRgb(style.color) || { r: 0, g: 0, b: 0, a: 1 };
          const bgParsed = getOpaqueBackground(el);
          const fgFinal = fgParsed.a < 1 ? blend(fgParsed, bgParsed) : fgParsed;
          const ratio = contrastRatio(fgFinal, bgParsed);
          return {
            text: normalizeText(el.textContent || '').slice(0, 60),
            ratio,
            minRatio,
            pass: ratio >= minRatio,
          };
        });

        return {
          semantics: {
            titleIsH2: titleEl?.tagName === 'H2',
            semanticListPass,
          },
          imageChecks,
          linkChecks,
          contrastChecks,
        };
      },
      c.SELECTORS
    );

    expect(report.semantics.titleIsH2, 'Cast List deve usar <h2> para o título da categoria').toBeTruthy();
    expect(
      report.semantics.semanticListPass,
      'Cast List deve usar <ul>/<li> envolvendo links dos cards'
    ).toBeTruthy();

    for (const imageCheck of report.imageChecks) {
      expect(
        imageCheck.primaryPass,
        `Cast List imagem principal com alt descritivo: ${JSON.stringify(imageCheck)}`
      ).toBeTruthy();
      expect(
        imageCheck.hoverPass,
        `Cast List imageHover deve usar alt=\"Foto de {name} (hover)\": ${JSON.stringify(imageCheck)}`
      ).toBeTruthy();
    }

    for (const linkCheck of report.linkChecks) {
      expect(
        linkCheck.pass,
        `Cast List link com nome acessível claro e teclado: ${JSON.stringify(linkCheck)}`
      ).toBeTruthy();
    }

    for (const contrast of report.contrastChecks) {
      expect(
        contrast.pass,
        `Cast List contraste insuficiente para "${contrast.text}" (${contrast.ratio.toFixed(2)} < ${contrast.minRatio})`
      ).toBeTruthy();
    }

    await this.#tabUntilFocused(this.cards().first(), 'primeiro card do Cast List');
    await this.#expectFocusVisible(this.cards().first(), 'primeiro card do Cast List');
    await this.#expectEnterOpensCard();
  }

  async expectCastListZoom200AndReflow320() {
    await this.page.setViewportSize({ width: 640, height: 960 });
    await this.page.waitForTimeout(150);
    await this.expectCastListVisible();

    await this.page.setViewportSize({ width: 320, height: 900 });
    await this.page.waitForTimeout(150);
    await expect(this.cardsGrid(), 'grid do Cast List em 320px').toBeVisible();

    const report = await this.root().evaluate(
      (root, selectors) => {
        const isVisible = (el) => {
          if (!el) return false;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            Number.parseFloat(style.opacity || '1') > 0 &&
            rect.width > 0 &&
            rect.height > 0
          );
        };

        const cards = [...root.querySelectorAll(selectors.card)].filter(isVisible);
        const uniqueLefts = [];
        for (const card of cards) {
          const left = Math.round(card.getBoundingClientRect().left);
          if (!uniqueLefts.some((value) => Math.abs(value - left) <= 4)) uniqueLefts.push(left);
        }

        const categoryList = root.querySelector(selectors.categoryList);
        let categoryScrollAllowed = true;
        if (categoryList instanceof HTMLElement) {
          const style = window.getComputedStyle(categoryList);
          categoryScrollAllowed =
            categoryList.scrollWidth <= categoryList.clientWidth + 1 ||
            /auto|scroll|hidden|overlay/i.test(style.overflowX || '');
        }

        return {
          singleColumnPass: uniqueLefts.length <= 1,
          columnCount: uniqueLefts.length,
          categoryScrollAllowed,
        };
      },
      c.SELECTORS
    );

    expect(
      report.singleColumnPass,
      `Cast List deve reorganizar em coluna única a 320px (colunas encontradas: ${report.columnCount})`
    ).toBeTruthy();
    expect(
      report.categoryScrollAllowed,
      'Seleção de times pode rolar horizontalmente em 320px por ser navegação essencial'
    ).toBeTruthy();
  }

  async expectTeamSelectionAccessibility() {
    const report = await this.categoryList().evaluate((root) => {
      const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const buttons = [...root.querySelectorAll('button')];
      return buttons.map((button) => {
        const visibleName = normalizeText(button.textContent || '');
        const accessibleName =
          normalizeText(button.getAttribute('aria-label') || '') ||
          normalizeText(button.getAttribute('title') || '') ||
          visibleName;
        const tabIndex = Number.parseInt(button.getAttribute('tabindex') || '0', 10);
        return {
          visibleName,
          accessibleName,
          selected: button.classList.contains('selected') || button.getAttribute('aria-pressed') === 'true',
          pass:
            visibleName.length > 0 &&
            accessibleName.toLowerCase().includes(visibleName.toLowerCase()) &&
            tabIndex !== -1,
        };
      });
    });

    expect(report.length, 'Seleção de times deve conter 3 botões acessíveis').toBe(
      c.TEXT.categoryButtons.length
    );
    expect(report[0]?.selected, 'primeiro botão inicia marcado como selecionado').toBeTruthy();

    for (const button of report) {
      expect(
        button.pass,
        `Seleção de times botão com nome acessível e foco de teclado: ${JSON.stringify(button)}`
      ).toBeTruthy();
    }

    const buttons = this.categoryButtons();
    await this.#tabUntilFocused(buttons.first(), 'primeiro botão da Seleção de times');
    await this.#expectFocusVisible(buttons.first(), 'primeiro botão da Seleção de times');

    await buttons.nth(1).focus();
    await this.page.keyboard.press('Enter');
    await expect(buttons.nth(1), 'Sub 17 deve ser acionável por Enter').toHaveClass(/selected/);
    await expect(this.headerTitle(), 'título deve acompanhar a seleção Sub 17').toHaveText(
      /^\s*Sub 17\s*$/
    );

    await buttons.nth(2).focus();
    await this.page.keyboard.press('Enter');
    await expect(buttons.nth(2), 'Elenco deve ser acionável por Enter').toHaveClass(/selected/);
    await expect(this.headerTitle(), 'título deve acompanhar a seleção Elenco').toHaveText(
      /^\s*Elenco\s*$/
    );
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {{ width: number, height: number, opacity: number, angleDeg: number, gap: number }} expected
   * @param {string} label
   */
  async #expectLayout(locator, expected, label) {
    const actual = await locator.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const m = new DOMMatrix(s.transform === 'none' ? undefined : s.transform);
      return {
        width: r.width,
        height: r.height,
        opacity: parseFloat(s.opacity),
        angleDeg: Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI),
        gap: Number.parseFloat(s.columnGap || s.gap || '0'),
      };
    });

    expect(actual.width, `${label} width`).toBeGreaterThanOrEqual(
      expected.width - c.TOLERANCE_PX
    );
    expect(actual.width, `${label} width`).toBeLessThanOrEqual(
      expected.width + c.TOLERANCE_PX
    );
    expect(actual.height, `${label} height`).toBeGreaterThanOrEqual(
      expected.height - c.TOLERANCE_PX
    );
    expect(actual.height, `${label} height`).toBeLessThanOrEqual(
      expected.height + c.TOLERANCE_PX
    );
    expect(actual.opacity, `${label} opacity`).toBe(expected.opacity);
    expect(actual.angleDeg, `${label} angle`).toBe(expected.angleDeg);
    expect(actual.gap, `${label} gap`).toBeGreaterThanOrEqual(expected.gap - c.TOLERANCE_PX);
    expect(actual.gap, `${label} gap`).toBeLessThanOrEqual(expected.gap + c.TOLERANCE_PX);
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} label
   */
  async #expectDisplayTypography(locator, label) {
    const style = await readComputedTypography(locator);
    expect(style.fontFamily, `${label} font-family`).toMatch(c.TYPOGRAPHY.display.fontFamily);
    expect(style.fontWeight, `${label} font-weight`).toBe(c.TYPOGRAPHY.display.fontWeight);
    expect(style.fontStyle, `${label} font-style`).toMatch(c.TYPOGRAPHY.display.fontStyle);
    expect(style.fontSize, `${label} font-size`).toBe(c.TYPOGRAPHY.display.fontSize);
    expect(
      lineHeightIs100Percent(style.lineHeight, style.fontSize),
      `${label} line-height ~100% (${style.lineHeight})`
    ).toBeTruthy();
    expect(
      letterSpacingIsZero(style.letterSpacing),
      `${label} letter-spacing ~0 (${style.letterSpacing})`
    ).toBeTruthy();
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} label
   */
  async #tabUntilFocused(locator, label) {
    await this.page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });

    for (let i = 0; i < 24; i++) {
      const focused = await locator.evaluate((el) => el === document.activeElement);
      if (focused) return;
      await this.page.keyboard.press('Tab');
    }

    const focused = await locator.evaluate((el) => el === document.activeElement);
    expect(focused, `${label} deve ser alcançável via Tab`).toBeTruthy();
  }

  /**
   * @param {import('@playwright/test').Locator} locator
   * @param {string} label
   */
  async #expectFocusVisible(locator, label) {
    const focusVisible = await locator.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const outlineWidth = Number.parseFloat(style.outlineWidth || '0');
      const outlineStyleOk = style.outlineStyle && style.outlineStyle !== 'none';
      const boxShadowOk = !!(style.boxShadow && style.boxShadow !== 'none');
      return outlineWidth > 0 || outlineStyleOk || boxShadowOk;
    });
    expect(focusVisible, `${label} deve exibir foco visível`).toBeTruthy();
  }

  async #expectEnterOpensCard() {
    const firstCard = this.cards().first();
    const href = await firstCard.getAttribute('href');
    expect(href, 'primeiro card do Cast List deve possuir href').toBeTruthy();

    const fromUrl = this.page.url();
    const targetUrl = new URL(String(href), fromUrl).toString();
    await firstCard.focus();
    await this.page.keyboard.press('Enter');
    await this.page.waitForURL((url) => url.toString() === targetUrl, { timeout: 15_000 });
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.categoryList().waitFor({ state: 'visible', timeout: 15_000 });
    await this.cards().first().waitFor({ state: 'visible', timeout: 15_000 });
  }
}

module.exports = { CastListComponent };
