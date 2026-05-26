# Testes de Acessibilidade

> **Spec:** [`tests/e2e/accessibility.spec.js`](../../tests/e2e/accessibility.spec.js)  
> **Páginas testadas:** Notícias · Elenco · Artigo · Jogador  
> **Total de testes:** 4 (1 por página — cada um cobre 6 regras WCAG)

---

## Como executar

```bash
# Todos os testes de acessibilidade
npx playwright test tests/e2e/accessibility.spec.js -c playwright.config.js

# Somente uma página
npx playwright test tests/e2e/accessibility.spec.js --grep "Elenco"

# Cross-browser (recomendado para acessibilidade)
npx playwright test tests/e2e/accessibility.spec.js --project=chromium --project=firefox

# Com interface gráfica
npm run test:e2e:ui -- --grep "Acessibilidade"
```

---

## Regras WCAG Verificadas

Cada teste de página executa **6 verificações** em sequência:

| ID | Regra WCAG | Critério de Sucesso | O que é verificado |
|----|-----------|---------------------|-------------------|
| AUT-A11Y-01 | 1.1.1 — Conteúdo não textual | Nível A | Todas as `<img>` visíveis têm `alt` descritivo; decorativas têm `aria-hidden="true"` ou `alt=""` com role presentation |
| AUT-A11Y-02 | 1.3.1 — Informações e Relações | Nível A | Página contém ao menos 2 elementos semânticos (`h1`–`h3`, `article`, `nav`, `main`, `section`, `aside`) |
| AUT-A11Y-03 | 1.4.3 — Contraste (Mínimo) | Nível AA | Elementos de texto visíveis têm razão de contraste ≥ 4,5:1 (texto normal) ou ≥ 3:1 (texto grande ≥ 24px ou ≥ 18,66px bold) |
| AUT-A11Y-04 | 2.1.1 — Teclado | Nível A | Todos os elementos interativos visíveis (`button`, `a[href]`, `[role="button"]`, inputs) têm `tabindex ≠ -1` |
| AUT-A11Y-05 | 2.4.4 — Finalidade do Link | Nível AA | Todos os `<a href>` visíveis têm texto acessível (`textContent`, `aria-label` ou `alt` da imagem filha) |
| AUT-A11Y-06 | 4.1.2 — Nome, Função, Valor | Nível A | Botões e `[role="tab"]` visíveis têm `aria-label` ou `textContent` não vazio |

---

## Testes por Página

### Página de Notícias (`/noticias`)

Foca em: imagens dos cards do Carousel News, links para artigos, botões de navegação do carousel.

### Página de Elenco (`/elenco`)

Foca em: imagens dos cards de jogadores, abas de categoria com ARIA, links para páginas individuais.

### Página de Artigo (`/noticias/[slug]`)

Foca em: imagem principal do artigo, links do sidebar, botões de compartilhamento, headings de seção.

### Página do Jogador (`/elenco/[slug]`)

Foca em: imagem do hero player, link do CTA, headings da seção de biografia, links do footer.

---

## Como Ler uma Falha

Cada falha inclui a regra, a página e o elemento problemático. Exemplo:

```
AUT-A11Y-01 WCAG 1.1.1 [Notícias]: imagem sem alt text
{"alt":"","pass":false,"src":"/content/dam/sada/foto-jogadora.jpg"}
```

```
AUT-A11Y-03 WCAG 1.4.3 [Elenco]: contraste insuficiente "Levantadora" (3.12 < 4.5)
```

```
AUT-A11Y-05 WCAG 2.4.4 [Artigo]: link sem texto acessível
{"href":"/noticias/outra-noticia","text":"","pass":false}
```

---

## Triagem de Bugs por Regra

### AUT-A11Y-01 — Alt text ausente
- **O que quebrou:** imagem renderizada sem o atributo `alt` preenchido no CMS/autoria
- **Onde verificar:** Universal Editor → campo `Alt Text` da imagem, ou atributo `alt` no HTML gerado
- **Quem resolve:** autoria de conteúdo (campo vazio) ou desenvolvimento (campo ausente no componente)

### AUT-A11Y-02 — Falta de semântica HTML
- **O que quebrou:** página com menos de 2 elementos semânticos (`h1`–`h3`, `article`, `nav`, etc.)
- **Onde verificar:** inspecionar o DOM da página — buscar se `<main>` ou `<article>` estão presentes
- **Quem resolve:** desenvolvimento (EDS block sem semântica adequada)

### AUT-A11Y-03 — Contraste insuficiente
- **O que quebrou:** texto com cor/fundo que não atinge a razão mínima de 4,5:1
- **Onde verificar:** DevTools → Computed → `color` + `background-color`; ferramenta [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Quem resolve:** design (paleta de cores) ou desenvolvimento (CSS)

### AUT-A11Y-04 — Elemento não alcançável por teclado
- **O que quebrou:** elemento interativo com `tabindex="-1"` ou fora da ordem de foco
- **Onde verificar:** navegar pela página com Tab e verificar se o elemento recebe foco
- **Quem resolve:** desenvolvimento (remover `tabindex="-1"` ou reposicionar no DOM)

### AUT-A11Y-05 — Link sem propósito
- **O que quebrou:** `<a>` com href mas sem texto visível, `aria-label` ou `alt` de imagem filha
- **Onde verificar:** buscar `<a>` que contenham apenas ícones SVG sem `aria-label`
- **Quem resolve:** desenvolvimento (adicionar `aria-label`) ou autoria (preencher texto do link)

### AUT-A11Y-06 — Botão/Tab sem label ARIA
- **O que quebrou:** `<button>` ou `[role="tab"]` sem `aria-label` e sem `textContent`
- **Onde verificar:** botões de navegação do carousel, abas de categoria sem texto visível
- **Quem resolve:** desenvolvimento (adicionar `aria-label="Próximo slide"`, por exemplo)

---

## Escopo dos Testes Automáticos vs. Auditoria Manual

Os testes automáticos cobrem as violações mais detectáveis via DOM. Eles **não substituem** uma auditoria completa.

| O que os testes cobrem | O que requer auditoria manual |
|------------------------|-------------------------------|
| Alt text ausente (detectável) | Alt text impreciso ou enganoso |
| Contraste calculável via CSS | Conteúdo sobre imagem/gradiente |
| Elementos sem nome ARIA | Fluxo lógico da ordem de leitura |
| Tabindex bloqueando teclado | Armadilhas de foco (focus traps) |
| Links sem texto | Descrições de imagens complexas |

**Ferramentas complementares recomendadas:**
- [axe DevTools](https://www.deque.com/axe/devtools/) — extensão Chrome/Firefox
- [WAVE](https://wave.webaim.org/) — análise visual online
- Leitores de tela: NVDA (Windows), VoiceOver (macOS/iOS)

---

## Notas

- Os testes analisam até **30 elementos de texto** (contraste) e **20 links/botões** por página para evitar timeout. Em páginas muito densas, o limite pode ser aumentado em [`accessibility.spec.js`](../../tests/e2e/accessibility.spec.js).
- A razão de contraste é calculada com a fórmula WCAG 2.x (luminância relativa). Texto sobre fundo com gradiente pode ter resultado impreciso — nesses casos, use auditoria manual.
