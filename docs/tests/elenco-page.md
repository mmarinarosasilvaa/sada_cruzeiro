# Página de Elenco — Cast List

> **Spec:** [`tests/e2e/elenco-page.spec.js`](../../tests/e2e/elenco-page.spec.js)  
> **URL padrão:** `https://main--cm-p181070-s22303-site-sada-cruzeiro--adobe-cm.aem.page/elenco`  
> **Componente:** Cast List (Adobe EDS — fonte híbrida: AEM ChildPagesServlet ou inserção manual)  
> **Total de testes:** 13

---

## Como executar

```bash
# Apenas esta página (todos os browsers)
npx playwright test tests/e2e/elenco-page.spec.js -c playwright.config.js

# Somente chromium, browser visível
npx playwright test tests/e2e/elenco-page.spec.js --project=chromium --headed --workers=1

# URL personalizada
E2E_BASE_URL=https://www.sadacruzeiro.com.br npx playwright test tests/e2e/elenco-page.spec.js

# Com interface gráfica
npm run test:e2e:ui -- --grep "Elenco"
```

---

## Categorias de Teste

### Filtros de Categoria `(6 testes)`

Valida as abas de filtragem do elenco (Elenco Principal, Sub-17, Sub-19, Sub-21 — conforme configuração). Testa tanto a renderização quanto a interatividade.

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-CL-F01 | Abas de categoria visíveis | Todos | Ao menos 1 aba `[role="tab"]` ou botão de categoria presente |
| AUT-CL-F02 | Clique em aba muda conteúdo | Chromium | Grid de cards atualiza ao clicar em aba diferente |
| AUT-CL-F03 | Aba ativa com `aria-selected` | Todos | Aba selecionada tem `aria-selected="true"` ou classe `.selected` |
| AUT-CL-F04 | Cards da categoria existem | Todos | Categoria ativa exibe ao menos 1 card de jogador |
| AUT-CL-F05 | Tab navega entre abas | Chromium | Tecla Tab move o foco para a próxima aba |
| AUT-CL-F06 | Arrow keys / Enter alternam abas | Chromium | ArrowRight ou Enter ativa a aba seguinte |

---

### Cards de Jogadores `(4 testes)`

Verifica a integridade dos dados de cada card individual — imagem, texto e formatação.

| ID | Teste | Browsers | O que valida |
|----|-------|----------|--------------|
| AUT-CL-C01 | Imagens dos cards com `src` | Todos | Cada `.cast-card img` tem `src` ou `data-src` preenchido |
| AUT-CL-C02 | Alt text nas imagens | Todos | Cada imagem tem `alt` descritivo (WCAG 1.1.1) |
| AUT-CL-C03 | Número do jogador válido | Todos | Campo de número, quando presente, contém 1–2 dígitos |
| AUT-CL-C04 | Posição do jogador não vazia | Todos | Campo de posição, quando presente, não está em branco |

---

### Layout e Acessibilidade `(3 testes)`

Garante conformidade visual e de acessibilidade — executados como baseline no Chromium.

| Teste | Browsers | O que valida |
|-------|----------|--------------|
| Layout e acessibilidade WCAG no chromium | Chromium | Dimensões do grid, contraste de cores, semântica `<h2>/<ul>/<li>`, foco visível, propósito dos links |
| Responsividade e reflow 320px | Todos | Grid em coluna única a 320px, sem scroll horizontal (WCAG 1.4.10) |
| Imagens com lazy loading | Todos | Imagens dos cards têm `loading="lazy"` ou `data-src` |

---

## Regras WCAG Verificadas

| Regra | Critério | Onde é testado |
|-------|----------|----------------|
| 1.1.1 | Alternativas de texto para imagens | AUT-CL-C02, layout chromium |
| 1.3.1 | Informações e relações (`<h2>`, `<ul>`, `<li>`) | Layout chromium |
| 1.4.3 | Contraste mínimo 4,5:1 | Layout chromium |
| 1.4.10 | Reflow — sem scroll horizontal em 320px | Responsividade |
| 2.1.1 | Teclado — todas as funções acessíveis | AUT-CL-F05, F06, layout chromium |
| 2.4.4 | Propósito do link | Layout chromium |
| 2.4.7 | Foco visível | Layout chromium |

---

## Estratégia de Execução por Browser

| Categoria | Chromium | Firefox | WebKit | Mobile |
|-----------|:--------:|:-------:|:------:|:------:|
| Filtros — visibilidade/estado | ✅ | ✅ | ✅ | ✅ |
| Filtros — interação/teclado | ✅ baseline | — | — | — |
| Cards — dados e imagens | ✅ | ✅ | ✅ | ✅ |
| Layout e acessibilidade WCAG | ✅ baseline | — | — | — |
| Responsividade 320px | ✅ | ✅ | ✅ | ✅ |

---

## Triagem de Bugs

| Sintoma | Categoria provável | Testes afetados |
|---------|-------------------|-----------------|
| Abas de categoria não aparecem | Filtros | F01 |
| Clicar em aba não atualiza cards | Filtros | F02 |
| Aba ativa sem indicador visual/ARIA | Filtros | F03 |
| Grid vazio após selecionar categoria | Filtros | F04 |
| Impossível navegar entre abas por teclado | Filtros | F05, F06 |
| Imagem de jogador quebrada | Cards | C01 |
| Imagem sem descrição (leitor de tela) | Cards | C02 |
| Número do jogador com formato errado | Cards | C03 |
| Posição do jogador em branco | Cards | C04 |
| Layout quebrado em telas pequenas | Responsividade | reflow test |
| Problema de contraste de cores | Acessibilidade | layout chromium |

---

## Notas

- **Campos opcionais:** número (`C03`) e posição (`C04`) são marcados como "No" na documentação EDS. Quando ausentes no DOM, os testes emitem `console.log` e não falham.
- **Seletores duais:** os seletores usam `.cast-card, .team-roster-card` e `[role="tab"], .team-roster-header-category-list > button` para suportar tanto o DOM atual quanto futuras refatorações. Veja [`constants/elenco.js`](../../tests/page-objects/constants/elenco.js).
- **AUT-CL-F06 fallback:** se o componente não implementar `[role="tab"]` com suporte a arrow keys, o teste usa Enter como fallback.
