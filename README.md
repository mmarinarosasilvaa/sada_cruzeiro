# SADA Cruzeiro — Testes E2E

Testes automatizados de ponta a ponta do site [sadacruzeiro.com.br](https://sadacruzeiro.com.br), desenvolvidos com [Playwright](https://playwright.dev/).

---

## Requisitos

- Node.js >= 18
- npm

---

## Instalação

```bash
npm install
npm run playwright:install
```

---

## Executar os testes

| Comando | O que faz |
|---------|-----------|
| `npm run test:e2e` | Todos os testes — Chromium + Mobile |
| `npm run test:e2e:ui` | Interface gráfica para acompanhar ao vivo |
| `npm run test:e2e:headed` | Browser visível, 1 worker (bom para depurar) |
| `npm run test:e2e:debug` | Modo passo a passo com Playwright Inspector |
| `npm run test:e2e:firefox` | Somente Firefox |
| `npm run test:e2e:design` | Valida tipografia/layout contra Figma (modo estrito) |

### Por página

```bash
npx playwright test tests/e2e/noticias-page.spec.js  -c playwright.config.js
npx playwright test tests/e2e/elenco-page.spec.js    -c playwright.config.js
npx playwright test tests/e2e/article-page.spec.js   -c playwright.config.js
npx playwright test tests/e2e/jogador-page.spec.js   -c playwright.config.js
npx playwright test tests/e2e/performance.spec.js    -c playwright.config.js
npx playwright test tests/e2e/accessibility.spec.js  -c playwright.config.js
```

### Por categoria

```bash
# Acessibilidade e WCAG
npx playwright test -c playwright.config.js --grep "A11Y|WCAG|acessibilidade"

# Performance
npx playwright test -c playwright.config.js --grep "PERF"

# Responsividade
npx playwright test -c playwright.config.js --grep "RES|responsiv|reflow|mobile"
```

---

## Páginas e Cobertura

| Página | Spec | Testes |
|--------|------|:------:|
| Notícias — Carousel News | `noticias-page.spec.js` | 19 |
| Elenco — Cast List | `elenco-page.spec.js` | 13 |
| Artigo | `article-page.spec.js` | 17 |
| Jogador | `jogador-page.spec.js` | 10 |
| Performance | `performance.spec.js` | 6 |
| Acessibilidade | `accessibility.spec.js` | 4 |
| **Total** | | **69** |

Documentação detalhada de cada página em [`docs/tests/`](docs/tests/README.md).

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `E2E_BASE_URL` | URL de staging AEM | Sobrescreve a URL base do site |
| `E2E_CAROUSEL_NEWS_URL` | `{BASE_URL}/noticias` | URL da página com Carousel News |
| `E2E_STRICT_DESIGN` | `0` | `1` → valida tipografia contra Figma |
| `E2E_REQUIRE_PLAYER_SECTION` | `0` | `1` → falha se bloco CLUBES estiver ausente |
| `E2E_DISABLE_GPU` | `0` | `1` → desativa GPU (útil em CI sem display) |

### Exemplo contra produção

```bash
E2E_BASE_URL=https://www.sadacruzeiro.com.br npm run test:e2e
```

---

## Browsers

| Projeto | Browser | Uso |
|---------|---------|-----|
| `chromium` | Chrome | Baseline principal |
| `firefox` | Firefox | Cross-browser |
| `mobile` | Pixel 5 | Swipe e responsivo mobile |

---

## Estrutura do Projeto

```
tests/
├── e2e/                    # Specs por página
├── page-objects/
│   ├── pages/              # Abertura e navegação de páginas
│   ├── components/         # Validações por componente
│   ├── constants/          # Seletores CSS e URLs
│   └── helpers/            # Utilitários (tipografia, layout, imagens)
docs/
└── tests/                  # Documentação de testes por página
```
