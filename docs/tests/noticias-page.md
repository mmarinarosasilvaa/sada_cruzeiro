# Página de Notícias — Carousel News

> **Spec:** [`tests/e2e/noticias-page.spec.js`](../../tests/e2e/noticias-page.spec.js)  
> **URL padrão:** `https://main--cm-p181070-s22303-site-sada-cruzeiro--adobe-cm.aem.page/noticias`  
> **Componente:** Carousel News (Adobe EDS — fonte híbrida: automática via AEM ou manual)  
> **Total de testes:** 19

---

## Como executar

```bash
# Apenas esta página (todos os browsers)
npx playwright test tests/e2e/noticias-page.spec.js -c playwright.config.js

# Somente chromium, com browser visível
npx playwright test tests/e2e/noticias-page.spec.js --project=chromium --headed --workers=1

# URL personalizada
E2E_CAROUSEL_NEWS_URL=https://www.sadacruzeiro.com.br/noticias npx playwright test tests/e2e/noticias-page.spec.js

# Com interface gráfica (recomendado para acompanhar)
npm run test:e2e:ui -- --grep "Notícias"
```

---

## Categorias de Teste

### Renderização `(6 testes)`

Garante que o Carousel News exibe conteúdo corretamente para o usuário final, independentemente da fonte de dados configurada (automática ou manual).

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-CAR-R01 | Título da seção visível | Chromium | Elemento `h2` do carousel existe e não está vazio |
| AUT-CAR-R02 | Cards renderizados | Todos | Ao menos 1 card `.carousel-item` presente no DOM |
| AUT-CAR-R03 | Imagens dos cards com `src` | Todos | Cada imagem tem atributo `src` ou `data-src` preenchido |
| AUT-CAR-R04 | Alt text em imagens | Todos | Cada imagem tem `alt` descritivo (WCAG 1.1.1) |
| AUT-CAR-R05 | Lazy loading ativo | Todos | Imagens têm `loading="lazy"` ou `data-src` (performance) |
| AUT-CAR-R06 | Links dos cards clicáveis | Todos | Cada card tem `<a href>` com destino preenchido |

---

### Navegação `(8 testes)`

Valida os mecanismos de interação do carousel: setas, loop circular e acessibilidade por teclado/swipe.

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-CAR-001 | Seta "Próximo" visível | Chromium | `button[aria-label='Próximo']` visível em desktop |
| AUT-CAR-002 | Seta direita avança card | Chromium | Texto/conteúdo do primeiro card muda após clique |
| AUT-CAR-003 | Loop circular (último → primeiro) | Chromium | Após `n` cliques (1 por card), retorna ao card inicial |
| AUT-CAR-004 | Seta esquerda retrocede | Chromium | Clique em "Anterior" reverte o avanço anterior |
| AUT-CAR-005 | Marcadores/indicadores existem | Todos | Ao menos 1 elemento de indicador de posição presente |
| AUT-CAR-006 | Teclado Tab+Enter avança | Chromium | Foco em botão "Próximo" + Enter muda o card ativo |
| AUT-CAR-007 | Teclado Tab+Enter retrocede | Chromium | Foco em botão "Anterior" + Enter reverte o card ativo |
| AUT-CAR-008 | Swipe esquerda (mobile) | Mobile | Arrastar da direita para esquerda avança o card |

---

### Responsivo `(5 testes)`

Confirma que o componente se adapta corretamente entre breakpoints e não quebra em zoom alto.

| ID | Teste | Viewport | O que valida |
|----|-------|----------|--------------|
| AUT-CAR-RES01 | Setas visíveis no desktop | ≥ 1200px (Chromium) | Botão "Próximo" é visível e clicável |
| AUT-CAR-RES02 | Marcadores visíveis no desktop | ≥ 1200px (Chromium) | Indicadores de posição presentes |
| AUT-CAR-RES03 | Setas ocultas no mobile | ≤ 768px (Todos) | Botão de navegação oculto ou ausente |
| AUT-CAR-RES04 | Swipe ativo no mobile | ≤ 768px (Todos) | Container scroll horizontal ativo |
| AUT-CAR-RES05 | Sem overflow no zoom 200% | 640px (Todos) | `scrollWidth ≤ clientWidth + 1` (WCAG 1.4.10) |

---

## Estratégia de Execução por Browser

| Categoria | Chromium | Firefox | WebKit | Mobile |
|-----------|:--------:|:-------:|:------:|:------:|
| Renderização | ✅ baseline | ✅ | ✅ | ✅ |
| Navegação (setas/teclado) | ✅ | — | — | — |
| Navegação (swipe) | — | — | — | ✅ |
| Responsivo | ✅ baseline | ✅ | ✅ | ✅ |

> Testes marcados com `—` são ignorados (`test.skip`) automaticamente naquele projeto.

---

## Triagem de Bugs

| Sintoma | Categoria provável | Testes afetados |
|---------|-------------------|-----------------|
| Carousel em branco / sem cards | Renderização | R02 |
| Imagens quebradas (ícone de erro) | Renderização | R03 |
| Imagem sem descrição (acessibilidade) | Renderização | R04 |
| Página lenta — muitas imagens carregadas de uma vez | Renderização | R05 |
| Cards sem link ou link quebrado | Renderização | R06 |
| Seta não avança / não retrocede | Navegação | CAR-002, CAR-004 |
| Carousel não fecha o loop | Navegação | CAR-003 |
| Impossível navegar por teclado | Navegação | CAR-006, CAR-007 |
| Swipe não funciona no celular | Navegação | CAR-008 |
| Setas aparecem no mobile | Responsivo | RES03 |
| Layout quebrado com zoom 200% | Responsivo | RES05 |

---

## Notas

- **URL customizada:** defina `E2E_CAROUSEL_NEWS_URL` se o componente não estiver em `/noticias`.
- **Seletores:** baseados em `.carousel-item` e `button[aria-label='Próximo']`. Se o DOM usar classes diferentes, ajuste [`constants/carousel-news.js`](../../tests/page-objects/constants/carousel-news.js).
- **AUT-CAR-003 (loop):** pode ser lento em carousels com muitos cards — é esperado.
