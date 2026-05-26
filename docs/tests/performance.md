# Testes de Performance

> **Spec:** [`tests/e2e/performance.spec.js`](../../tests/e2e/performance.spec.js)  
> **Páginas testadas:** Notícias · Elenco · Artigo  
> **Total de testes:** 6 (2 por página)

---

## Como executar

```bash
# Todos os testes de performance
npx playwright test tests/e2e/performance.spec.js -c playwright.config.js --project=chromium

# Somente uma página
npx playwright test tests/e2e/performance.spec.js -c playwright.config.js --project=chromium --grep "Notícias"

# Com interface gráfica
npm run test:e2e:ui -- --grep "Performance"
```

---

## Métricas Testadas

| ID | Métrica | Limite | Referência |
|----|---------|--------|------------|
| AUT-PERF-01 | Tempo de carregamento da página (`load` event) | < 3 000 ms | Core Web Vitals — LCP orientativo |
| AUT-PERF-02 | Imagens visíveis no viewport inicial | ≤ 5 | Lazy loading eficaz (Intersection Observer) |
| AUT-PERF-04 | Total de nós no DOM | < 2 000 | Complexidade da árvore DOM |

> **AUT-PERF-03** (tempo de resposta da API ChildPagesServlet < 1s) não é testado automaticamente via E2E pois exige interceptação de rede com credenciais de ambiente. Monitore via Network tab no DevTools ou Lighthouse CI.

---

## Testes por Página

### Página de Notícias

| Teste | O que faz |
|-------|-----------|
| AUT-PERF-01 \| AUT-PERF-02: load time < 3s e lazy loading | Navega para `/noticias`, mede tempo até o evento `load`, conta imagens visíveis no viewport |
| AUT-PERF-04: DOM com menos de 2000 nós | Navega para `/noticias`, conta todos os elementos do DOM com `querySelectorAll('*')` |

### Página de Elenco

| Teste | O que faz |
|-------|-----------|
| AUT-PERF-01 \| AUT-PERF-02: load time < 3s e lazy loading | Navega para `/elenco`, mede tempo até o evento `load`, conta imagens visíveis no viewport |
| AUT-PERF-04: DOM com menos de 2000 nós | Navega para `/elenco`, conta todos os elementos do DOM |

### Página de Artigo

| Teste | O que faz |
|-------|-----------|
| AUT-PERF-01 \| AUT-PERF-02: load time < 3s e lazy loading | Navega para `/noticias/noticia-de-teste-2`, mede tempo até `load`, conta imagens no viewport |
| AUT-PERF-04: DOM com menos de 2000 nós | Navega para o artigo, conta todos os elementos do DOM |

---

## Interpretação dos Resultados

### AUT-PERF-01 — Page Load

```
load time: 1 842ms   ✅ passou (< 3 000ms)
load time: 3 210ms   ❌ falhou
```

O tempo é medido do início do `page.goto()` até o evento `load` ser disparado. Inclui rede, parsing e rendering inicial. Em ambientes de staging com cold start, é comum ver valores próximos do limite — considere rodar 2–3 vezes antes de tratar como regressão.

### AUT-PERF-02 — Lazy Loading

```
imagens no viewport: 3   ✅ passou (≤ 5)
imagens no viewport: 9   ❌ falhou — lazy loading pode estar desativado
```

Conta imagens cujo bounding rect está dentro da janela visível (1280×720) no momento em que o evento `load` dispara. Se o número for alto, verificar o atributo `loading="lazy"` nas imagens acima da dobra.

### AUT-PERF-04 — DOM Size

```
nós no DOM: 1 247   ✅ passou (< 2 000)
nós no DOM: 2 438   ❌ falhou — possível excesso de componentes ou markup duplicado
```

DOM com mais de 2 000 nós afeta renderização inicial e responsividade de interações. Causas comuns: carousels que renderizam todos os slides no DOM, listas não virtualizadas, componentes aninhados em excesso.

---

## Triagem de Bugs

| Sintoma | Causa provável | Ação recomendada |
|---------|---------------|------------------|
| Load time > 3s | Imagens não otimizadas, fonts bloqueantes, JS pesado | Verificar Network tab — buscar recursos > 500KB ou waterfall com bloqueios |
| Muitas imagens no viewport (PERF-02) | `loading="lazy"` ausente ou ignorado pelo browser | Confirmar o atributo `loading="lazy"` nos `<img>` acima da dobra |
| DOM > 2000 nós | Carousel renderizando todos os slides, listas não paginadas | Inspecionar quantos `.carousel-item` / `.team-roster-card` estão no HTML |

---

## Notas

- **Ambiente:** performance varia entre staging e produção. Usar `E2E_BASE_URL` para testar em produção.
- **Rede:** testes rodados sem throttling de rede. Para simular 4G/3G, use `--browser-option=--throttle-network` ou Lighthouse CI.
- **CI:** em pipelines com runners compartilhados, `load time` pode ser 20–40% mais lento que local. Considere aumentar o limite para 5s no CI com `process.env.CI ? 5000 : 3000`.
