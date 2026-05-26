# Plano de Testes E2E — SADA Cruzeiro

Testes automatizados de ponta a ponta do site [sadacruzeiro.com.br](https://sadacruzeiro.com.br), cobrindo renderização, navegação, responsividade, acessibilidade (WCAG 2.1) e performance.

---

## Visão Geral

| Página | Spec | Testes | Categorias |
|--------|------|:------:|------------|
| [Página de Notícias](./noticias-page.md) | `noticias-page.spec.js` | 19 | Renderização · Navegação · Responsivo |
| [Página de Elenco](./elenco-page.md) | `elenco-page.spec.js` | 13 | Filtros · Cards · Layout · Acessibilidade |
| [Página de Artigo](./article-page.md) | `article-page.spec.js` | 17 | Conteúdo · Compartilhamento · Acessibilidade · Responsivo |
| [Página do Jogador](./jogador-page.md) | `jogador-page.spec.js` | 10 | Hero Player · Player Section · Footer |
| [Performance](./performance.md) | `performance.spec.js` | 6 | Load time · Lazy loading · DOM size |
| [Acessibilidade](./accessibility.md) | `accessibility.spec.js` | 4 | WCAG 1.1.1 · 1.3.1 · 1.4.3 · 2.1.1 · 2.4.4 · 4.1.2 |
| **Total** | | **69** | |

---

## Como Executar

### Todos os testes

```bash
npm run test:e2e
```

### Com interface gráfica (acompanhar ao vivo)

```bash
npm run test:e2e:ui
```

### Por página individual

```bash
# Notícias
npx playwright test tests/e2e/noticias-page.spec.js -c playwright.config.js

# Elenco
npx playwright test tests/e2e/elenco-page.spec.js -c playwright.config.js

# Artigo
npx playwright test tests/e2e/article-page.spec.js -c playwright.config.js

# Jogador
npx playwright test tests/e2e/jogador-page.spec.js -c playwright.config.js

# Performance
npx playwright test tests/e2e/performance.spec.js -c playwright.config.js --project=chromium

# Acessibilidade
npx playwright test tests/e2e/accessibility.spec.js -c playwright.config.js
```

### Por categoria de teste

```bash
# Apenas testes de renderização
npx playwright test -c playwright.config.js --grep "AUT-CAR-R|AUT-CL-C|AUT-ART-C"

# Apenas acessibilidade e WCAG
npx playwright test -c playwright.config.js --grep "A11Y|WCAG|acessibilidade"

# Apenas performance
npx playwright test -c playwright.config.js --grep "PERF"

# Apenas responsividade
npx playwright test -c playwright.config.js --grep "RES|responsiv|reflow|mobile"
```

### Contra produção

```bash
E2E_BASE_URL=https://www.sadacruzeiro.com.br npm run test:e2e
```

---

## Estrutura dos IDs de Teste

```
AUT-CAR-001    → Carousel News   / Navegação
AUT-CAR-R01    → Carousel News   / Renderização
AUT-CAR-RES01  → Carousel News   / Responsivo
AUT-CL-F01     → Cast List       / Filtros de Categoria
AUT-CL-C01     → Cast List       / Cards de Jogadores
AUT-ART-C01    → Article         / Conteúdo
AUT-ART-S01    → Article         / Compartilhamento Social
AUT-PERF-01    → Performance     / (cross-page)
AUT-A11Y-01    → Acessibilidade  / (cross-page)
```

---

## Browsers e Projetos

| Projeto | Browser | Uso |
|---------|---------|-----|
| `chromium` | Chrome/Chromium | Baseline principal — testes visuais, interação, WCAG estrito |
| `firefox` | Firefox | Cross-browser de renderização e acessibilidade básica |
| `webkit` | Safari | Cross-browser de renderização |
| `mobile` | Pixel 5 (375×812) | Swipe, responsivo mobile |

Testes que requerem interação avançada (setas do carousel, teclado) rodam apenas no `chromium`. Testes de conteúdo e responsividade rodam em todos.

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `E2E_BASE_URL` | URL de staging AEM | Base URL do site |
| `E2E_CAROUSEL_NEWS_URL` | `{BASE_URL}/noticias` | URL da página com Carousel News |
| `E2E_STRICT_DESIGN` | `0` | `1` → valida tipografia/layout contra Figma (bloqueia) |
| `E2E_REQUIRE_PLAYER_SECTION` | `0` | `1` → falha se bloco CLUBES estiver ausente |

---

## Categorias por Tipo de Falha

Use esta tabela quando um bug for reportado e você precisar identificar quais testes cobrem a área afetada.

| Tipo de bug | Specs relevantes | IDs afetados |
|-------------|-----------------|--------------|
| Imagem quebrada / sem src | noticias, elenco, article, jogador | R03, C01, C03, C01 |
| Imagem sem alt text | noticias, elenco, article, accessibility | R04, C02, C04, A11Y-01 |
| Lazy loading desativado | noticias, elenco, article, performance | R05, lazy loading, PERF-02 |
| Carousel não navega | noticias | CAR-002, CAR-003, CAR-004 |
| Swipe não funciona | noticias, article | CAR-008, sidebar mobile |
| Setas visíveis no mobile | noticias | RES03 |
| Abas de filtro não funcionam | elenco | F02, F03 |
| Navegação por teclado quebrada | elenco, noticias, accessibility | F05, F06, CAR-006, A11Y-04 |
| Contraste insuficiente | article, accessibility | WCAG hero, A11Y-03 |
| Botão de share ausente/errado | article | S01, S02, S03, S04 |
| URL incorreta no share | article | S05 |
| Página lenta (> 3s) | performance | PERF-01 |
| DOM excessivamente grande | performance | PERF-04 |
| Reflow quebrado em 320px | elenco, article | reflow, sidebar 320px |

---

## Arquitetura dos Testes

```
tests/
├── e2e/                          # Specs organizados por página
│   ├── noticias-page.spec.js
│   ├── elenco-page.spec.js
│   ├── article-page.spec.js
│   ├── jogador-page.spec.js
│   ├── performance.spec.js
│   └── accessibility.spec.js
└── page-objects/
    ├── pages/                    # Navegação e abertura de páginas
    │   ├── CarouselNewsPage.js
    │   ├── ElencoPage.js
    │   ├── ArticlePage.js
    │   └── PlayerPage.js
    ├── components/               # Lógica de validação por componente
    │   ├── CarouselNewsComponent.js
    │   ├── CastListComponent.js
    │   ├── ArticleHeroComponent.js
    │   ├── ArticleContentComponent.js
    │   ├── ArticleSidebarComponent.js
    │   ├── ArticleSharingComponent.js
    │   ├── HeroPlayerComponent.js
    │   ├── PlayerSectionComponent.js
    │   └── FooterSectionComponent.js
    ├── constants/                # Seletores CSS, textos e configurações
    │   ├── carousel-news.js
    │   ├── elenco.js
    │   ├── footer-section.js
    │   ├── hero-labels.js
    │   ├── player-section.js
    │   └── urls.js
    └── helpers/                  # Utilitários reutilizáveis
        ├── assert-images-loaded.js
        ├── layout.js
        └── typography.js
```
