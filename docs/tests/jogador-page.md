# Página do Jogador

> **Spec:** [`tests/e2e/jogador-page.spec.js`](../../tests/e2e/jogador-page.spec.js)  
> **URL padrão:** `https://main--cm-p181070-s22303-site-sada-cruzeiro--adobe-cm.aem.page/elenco/alexandre`  
> **Componentes:** Hero Player · Player Section (Clubes, Informações, Biografia) · Footer  
> **Total de testes:** 10

---

## Como executar

```bash
# Apenas esta página (todos os browsers)
npx playwright test tests/e2e/jogador-page.spec.js -c playwright.config.js

# Somente chromium, browser visível
npx playwright test tests/e2e/jogador-page.spec.js --project=chromium --headed --workers=1

# URL personalizada (outro jogador)
E2E_BASE_URL=https://www.sadacruzeiro.com.br npx playwright test tests/e2e/jogador-page.spec.js

# Forçar falha quando bloco Player Section não estiver presente
E2E_REQUIRE_PLAYER_SECTION=1 npx playwright test tests/e2e/jogador-page.spec.js

# Ativar validação estrita de tipografia/design
E2E_STRICT_DESIGN=1 npx playwright test tests/e2e/jogador-page.spec.js --project=chromium

# Com interface gráfica
npm run test:e2e:ui -- --grep "Jogador"
```

---

## Categorias de Teste

### Hero Player `(5 testes)`

Valida o bloco principal de apresentação do jogador: foto, número, posição, nome e CTA de retorno ao elenco.

| Teste | Browsers | O que valida |
|-------|----------|--------------|
| Bloco Hero Player carrega | Todos | Elemento `.hero-player` visível no DOM |
| Número, info e imagens sem falhas | Todos | Número do jogador presente (quando configurado); todas as imagens carregadas sem erro |
| CTA exibe link | Todos | `<a href>` dentro do `.hero-player` com href preenchido |
| Position: conteúdo, estrutura e tipografia | Todos (design estrito: Chromium) | Texto de posição visível, dentro de `<div>` no hero; log de tipografia comparado com Figma |
| Name: conteúdo, estrutura e tipografia | Todos (design estrito: Chromium) | Nome do jogador visível, dentro de `<div>` no hero; log de tipografia comparado com Figma |

---

### Player Section — Clubes, Informações e Biografia `(4 testes)`

Valida o bloco de detalhes do jogador. Todos os testes desta seção fazem skip automaticamente se o bloco não estiver presente na build atual.

| Teste | Browsers | O que valida | Comportamento se ausente |
|-------|----------|--------------|--------------------------|
| Clubes: cada card exibe logo e informações | Todos | `div.team` com `.team-logo` e `.team-info` | Skip (não é falha) |
| Informações do jogador: campos opcionais | Todos | Campos dentro de `.player-info` com valores válidos | Skip se `.player-info` ausente |
| Biografia: tipografia e layout do H1 | Todos | `h1` presente com dimensões e fonte corretas | — |
| Biografia: botão "Ver mais" expande texto | Todos | Clique em "Ver mais" revela o conteúdo completo | — |

---

### Footer `(1 teste)`

Valida tipografia e layout estritos do rodapé na página do jogador.

| Teste | Browsers | O que valida |
|-------|----------|--------------|
| Rodapé: título, item e copyright com design estrito | Todos | Fonte, peso, tamanho, line-height, letter-spacing e posicionamento (px) de cada zona do footer |

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `E2E_BASE_URL` | URL de staging | Base URL do site |
| `E2E_REQUIRE_PLAYER_SECTION` | `0` | `1` → falha se bloco CLUBES não estiver presente |
| `E2E_STRICT_DESIGN` | `0` | `1` → tipografia do Hero Player falha se divergir do Figma |

---

## Triagem de Bugs

| Sintoma | Categoria provável | Testes afetados |
|---------|-------------------|-----------------|
| Bloco `.hero-player` não aparece | Hero | carrega |
| Imagem do jogador quebrada | Hero | imagens sem falhas |
| CTA sem href / link inválido | Hero | CTA exibe link |
| Nome ou posição sem texto | Hero | name / position |
| Cards de clubes sem logo | Player Section | Clubes |
| Informações do jogador em branco | Player Section | Informações |
| Biografia sem título H1 | Player Section | Biografia |
| "Ver mais" não expande o texto | Player Section | Biografia |
| Tipografia do rodapé diverge do Figma | Footer | design estrito |

---

## Notas

- **Player Section:** os testes de Clubes e Informações emitem `skip` (não falha) quando o bloco não está presente na build — é comum em publicações parciais. Use `E2E_REQUIRE_PLAYER_SECTION=1` em pipelines que exijam o bloco obrigatoriamente.
- **Tipografia:** os testes de position e name logam no console os valores reais vs. Figma. Somente com `E2E_STRICT_DESIGN=1` eles bloqueiam o pipeline — recomendado para releases.
- **Firefox:** validação estrita de design desativada no Firefox por variações de renderização de fonte entre SOs.
- **URL de teste:** aponta para o jogador "alexandre". Troque via `E2E_BASE_URL` para testar outro atleta.
