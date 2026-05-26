# Página de Artigo

> **Spec:** [`tests/e2e/article-page.spec.js`](../../tests/e2e/article-page.spec.js)  
> **URL padrão:** `https://main--cm-p181070-s22303-site-sada-cruzeiro--adobe-cm.aem.page/noticias/noticia-de-teste-2`  
> **Componentes:** Article Hero · Article Content · Article Sidebar (Carousel News de últimas notícias) · Compartilhamento Social  
> **Total de testes:** 17

---

## Como executar

```bash
# Apenas esta página (todos os browsers)
npx playwright test tests/e2e/article-page.spec.js -c playwright.config.js

# Somente chromium, browser visível
npx playwright test tests/e2e/article-page.spec.js --project=chromium --headed --workers=1

# URL personalizada
E2E_BASE_URL=https://www.sadacruzeiro.com.br npx playwright test tests/e2e/article-page.spec.js

# Com interface gráfica
npm run test:e2e:ui -- --grep "Artigo"
```

---

## Categorias de Teste

### Conteúdo `(5 testes)`

Verifica a presença e integridade dos dados editoriais do artigo: título, data, imagem e corpo do texto.

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-ART-C01 | Título do artigo presente | Todos | `h1` ou `h2.title` visível com ao menos 10 caracteres |
| AUT-ART-C02 | Data de publicação presente | Todos | Campo `[class*="date"]` ou `<time>` visível e não vazio |
| AUT-ART-C03 | Featured image com `src` | Todos | `img[class*="featured"]` ou `main figure img` com `src` preenchido |
| AUT-ART-C04 | Featured image com alt descritivo | Todos | `alt` ≥ 5 caracteres e diferente de `"image"` (WCAG 1.1.1) |
| AUT-ART-C05 | Artigo com ao menos 2 parágrafos | Todos | `article p` com `count ≥ 2` |

---

### Compartilhamento Social `(6 testes)`

Garante que os botões de compartilhamento estão presentes, funcionais e apontam para as redes corretas com a URL do artigo.

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-ART-S04 | Ao menos 3 botões de share visíveis | Todos | `[class*="share"] a[href]` com `count ≥ 3` |
| AUT-ART-S01 | Link do Facebook presente | Todos | Href contém `"facebook"` |
| AUT-ART-S02 | Link do Twitter/X presente | Todos | Href contém `"twitter"` ou `"x.com"` |
| AUT-ART-S03 | Link do LinkedIn presente | Todos | Href contém `"linkedin"` |
| AUT-ART-S05 | URLs contêm URL do artigo | Todos | Ao menos 1 link de share contém o domínio ou URL encodada da página |
| AUT-ART-S06 | Ao menos 3 ícones de share | Todos | `[class*="share-icon"]`, `img` ou `svg` dentro do bloco de share |

---

### Acessibilidade e Responsivo `(6 testes)`

Valida conformidade WCAG do hero e do sidebar, além do comportamento em viewports reduzidos e mobile.

| Teste | Browsers | O que valida |
|-------|----------|--------------|
| Hero article: acessibilidade WCAG no bloco principal | Chromium | `h1`, `nav[breadcrumb]`, `figure/figcaption`, contraste, ordem de leitura, foco visível |
| Imagens do artigo com lazy loading | Todos | `loading="lazy"` ou `data-src` em todas as imagens do `<main>` |
| Sidebar: acessibilidade WCAG e reflow 320px | Chromium | Headings `h2/h3`, lista semântica, contraste, foco, sem overflow próprio em 320px |
| Sidebar carrossel: swipe horizontal (mobile) | Mobile | Arrastar horizontalmente desloca os cards de últimas notícias |
| Hero: componentes visíveis + snapshot tipografia | Chromium | Título, autor, data e legenda visíveis; log de tipografia comparado com Figma |
| Content: texto visível + snapshot tipografia | Chromium | Parágrafo principal visível; log de tipografia comparado com Figma |

---

## Regras WCAG Verificadas

| Regra | Critério | Onde é testado |
|-------|----------|----------------|
| 1.1.1 | Alt text em imagens | C04, acessibilidade |
| 1.3.1 | Semântica HTML (`h1`, `nav`, `figure`, `ol/ul`) | Acessibilidade hero |
| 1.4.3 | Contraste mínimo 4,5:1 | Acessibilidade hero e sidebar |
| 1.4.10 | Reflow — sem scroll horizontal em 320px | Sidebar responsivo |
| 2.1.1 | Teclado — links e botões alcançáveis | Acessibilidade hero e sidebar |
| 2.4.4 | Propósito do link | Acessibilidade hero e sidebar |
| 2.4.7 | Foco visível | Acessibilidade sidebar |
| 2.5.1 | Ações por ponteiro (swipe) | Sidebar carrossel mobile |
| 2.5.2 | Ativação no up-event (sem `onclick`/`javascript:void`) | Sidebar |

---

## Estratégia de Execução por Browser

| Categoria | Chromium | Firefox | WebKit | Mobile |
|-----------|:--------:|:-------:|:------:|:------:|
| Conteúdo | ✅ | ✅ | ✅ | ✅ |
| Compartilhamento | ✅ | ✅ | ✅ | ✅ |
| Acessibilidade WCAG (hero/sidebar) | ✅ baseline | — | — | — |
| Lazy loading | ✅ | ✅ | ✅ | ✅ |
| Sidebar swipe | — | — | — | ✅ |
| Snapshots tipografia | ✅ | — | — | — |

---

## Triagem de Bugs

| Sintoma | Categoria provável | Testes afetados |
|---------|-------------------|-----------------|
| Título não aparece ou muito curto | Conteúdo | C01 |
| Data de publicação ausente | Conteúdo | C02 |
| Imagem principal quebrada | Conteúdo | C03 |
| Imagem sem alt text ou com alt genérico | Conteúdo | C04 |
| Artigo sem texto / parágrafos ausentes | Conteúdo | C05 |
| Botões de share invisíveis | Compartilhamento | S04 |
| Link do Facebook/Twitter/LinkedIn errado | Compartilhamento | S01, S02, S03 |
| URL do artigo não vai no link de share | Compartilhamento | S05 |
| Ícones de share ausentes | Compartilhamento | S06 |
| Problema de contraste no hero | Acessibilidade | acessibilidade WCAG |
| Breadcrumb sem semântica `<nav>/<ol>` | Acessibilidade | acessibilidade WCAG |
| Imagens carregadas todas de uma vez | Performance | lazy loading |
| Layout quebrado em 320px | Responsivo | sidebar responsivo |
| Swipe do carrossel não funciona no celular | Responsivo | sidebar mobile |

---

## Notas

- **Snapshot de tipografia:** os testes de snapshot (`logDesignSnapshot`) são informativos — logam no console diferenças entre o DOM atual e os valores do Figma, mas **não bloqueiam** a execução. Use `E2E_STRICT_DESIGN=1` para torná-los bloqueantes.
- **Compartilhamento:** se o bloco de share não estiver na sidebar mas em outra posição do artigo, atualize os seletores em [`ArticleSharingComponent.js`](../../tests/page-objects/components/ArticleSharingComponent.js).
- **URL de teste:** `noticia-de-teste-2` é a página de homologação. Para rodar em produção, use `E2E_BASE_URL`.
