# intelium.ai · site institucional

Site da Intelium (PT-BR e EN, 62 páginas) em Next.js 16 com export estático. O mesmo código é publicado em dois ambientes:

| | Teste (DSV) | Produção (PRD) |
|---|---|---|
| Repositório | GitHub `intelium-pages/intelium-homepage` | GitLab `excelium-tech/internal/intelium-website` |
| Endereço | https://intelium-pages.github.io/intelium-homepage/ | https://intelium.ai |
| Quem publica | GitHub Actions (`.github/workflows/pages.yml`) | Hostinger, a cada push na `main` |
| Buscadores | bloqueados (`noindex` + `robots.txt` Disallow) | liberados |
| Formulários | gravam no branch `dsv` do Neon | gravam no branch `production` do Neon |

Os dois repositórios têm os mesmos commits. **Toda mudança passa primeiro pelo GitHub** e só depois vai para o GitLab.

## Como atualizar o site

O conteúdo é desenhado no Claude Design e exportado como HTML estático para `public/`. **Não edite as páginas à mão em `public/`**: a próxima exportação apaga a mudança.

São três comandos, sempre nesta ordem:

```bash
# 1. Teste: valida e publica no GitHub Pages
npm run publicar:teste -- "content: o que mudou"

# 2. Confira em https://intelium-pages.github.io/intelium-homepage/

# 3. Produção: abre o merge request no GitLab com o mesmo commit do teste
npm run publicar:prd
#    o merge do MR publica no intelium.ai

# 4. Depois do merge: iguala os dois repositórios
npm run publicar:sync
```

O que cada um faz:

- **`publicar:teste`** traz as duas origens, aplica a exportação nova se houver uma em `.export/` (um `.zip` ou a pasta exportada), roda lint, build e testes nos modos produção e teste, faz o commit e envia para a `main` do GitHub. Mudanças feitas direto no repositório (README, testes, `.htaccess`) entram no mesmo commit.
- **`publicar:prd`** só funciona se a versão local for exatamente a que está no teste. Cria uma branch `release/AAAAMMDD-HHMM` no GitLab e abre o MR. Se já houver um MR de release aberto com uma versão anterior, atualiza esse mesmo MR. Nunca envia para a `main` do GitLab.
- **`publicar:sync`** leva o commit de merge do GitLab para o GitHub e mostra se os dois estão iguais. Só envia para o GitHub o que já está em produção: commits locais que não passaram pelo teste são recusados. Se o MR foi aceito com squash, realinha os dois repositórios com a `main` do GitLab, desde que o conteúdo seja idêntico.

Para aplicar uma exportação sem publicar: `npm run sync-site -- /caminho/da/exportacao`. O `sync-site` preserva o `public/.htaccess` e as imagens da página 404, e ignora `CNAME`, `README.md`, `.nojekyll` e `404.html` da exportação.

Um push direto na `main` do GitLab publica em produção na hora. Use sempre os comandos acima.

## O que a publicação faz com as páginas

As páginas em `public/` ficam como o Claude Design exportou: um template que um script (`support.js`) monta no navegador. No build, `scripts/site-transform.mjs` gera em `out/` a versão publicada, nos dois ambientes:

| Etapa | O que faz |
|---|---|
| Links internos | `./pasta/index.html` vira `./pasta/`, igual ao canonical e ao sitemap |
| Títulos e descrições | vêm de `seo/meta.json` (até 60 e 155 caracteres) |
| Dados estruturados | `BreadcrumbList` em todas as páginas internas; `Service`, `AboutPage`, `ContactPage` e `CollectionPage` conforme `seo/schema.json` |
| `<head>` | título, meta, canonical, hreflang, CSS e JSON-LD saem do `<body>` e vão para o `<head>` |
| React | servido de `/vendor/`, não mais do `unpkg.com` |
| Prerender | o HTML já renderizado vira o conteúdo real da página; o template fica num `<template>` e o script assume ao carregar |

O prerender precisa de um navegador, então é feito na publicação, não no build:

```bash
npm run prerender     # renderiza as 62 páginas e grava prerender/**/page.json
```

Os snapshots são versionados. Os builds do GitHub, do GitLab e da Hostinger só encaixam o snapshot na página, sem abrir navegador. Cada snapshot guarda o hash da página que o gerou: se `public/`, `seo/` ou os transforms mudarem, a página sai sem prerender e **os testes falham** até rodar `npm run prerender` de novo. Requer Playwright (`npm i -g playwright && npx playwright install chromium`); o `publicar:teste` roda esse passo sozinho quando o Playwright está instalado.

Para mudar um título ou uma descrição, edite `seo/meta.json`, rode `npm run prerender` e publique.

## Desenvolvimento

```bash
npm ci
npm run build      # gera out/ (versão de produção)
npm test           # testa o export em out/
npm run preview    # serve out/ em http://localhost:4173
npm run lint
```

Para reproduzir o build de teste: `SITE_ENV=dsv npm run build && SITE_ENV=dsv npm test`.

## O que muda entre os ambientes

O repositório guarda a versão de produção. As diferenças são aplicadas no build, por variáveis que só o GitHub Actions define:

- `SITE_ENV=dsv`: depois do build, `scripts/postbuild.mjs` troca o `robots.txt` por `Disallow: /` e inclui `noindex, nofollow` em todas as páginas de `out/`. Também aponta os formulários de contato e newsletter para o branch `dsv` do projeto no Neon, uma cópia isolada do banco: um envio feito no site de teste grava de verdade, mas nunca chega à produção. Se o endereço de produção não for reconhecido no `lead-api.js` (por exemplo, depois de mudar numa exportação nova), o build cai para um modo simulado, em que nada é gravado.
- `BASE_PATH` e `NEXT_PUBLIC_BASE_PATH`: a subpasta do GitHub Pages (`/intelium-homepage`), usada pela página 404. As páginas do site usam só caminhos relativos e funcionam em qualquer pasta.

O GitHub Pages ignora o `.htaccess`. Cache e compressão só podem ser conferidos na Hostinger.

## Deploy na Hostinger

A cada push na `main` do GitLab, a Hostinger clona o repositório, roda `npm install` e `npm run build` (Node 22) e publica `out/` em `public_html/`. O tipo de app é `react` (frontend estático); o tipo `next` tentaria subir um servidor, que não existe com `output: "export"`.

O CI do GitLab (`.gitlab-ci.yml`) roda build, lint, `npm test` e os scans de segurança em cada push e MR.

## Estrutura

```
app/
  layout.tsx          fonte Inter local e metadata (usados só pela página 404)
  not-found.tsx       404 (vira out/404.html)
public/
  index.html …        o site exportado: páginas, assets/, support.js, viz.js, scenes.js, lead-api.js
  robots.txt          versão de produção (Allow + Sitemap)
  sitemap.xml
  .htaccess           404, compressão e cache na Hostinger
scripts/
  postbuild.mjs       bloqueia buscadores no build de teste
  sync-site.mjs       troca o conteúdo de public/ por uma exportação nova
  site-transform.mjs  links, títulos, dados estruturados, head, React e prerender (roda no build)
  prerender.mjs       gera os snapshots de prerender (precisa de navegador)
  publicar.sh         publicação em teste e em produção (npm run publicar:*)
seo/
  meta.json           títulos e descrições por rota
  schema.json         dados estruturados
prerender/            snapshots das páginas renderizadas (gerados, versionados)
tests/
  export.test.mjs     testes do export (node:test)
.github/workflows/    deploy de teste no GitHub Pages
.gitlab-ci.yml        CI de produção
```

## O que os testes garantem

- A home é a do site, não a página "em construção"
- Toda URL do `sitemap.xml` tem página, e toda página está no sitemap
- Todo link interno, imagem, script e CSS referenciado existe
- As páginas usam só caminhos relativos
- Os `hreflang` apontam para páginas que existem
- A 404 existe e nunca é indexada
- A indexação bate com o ambiente (liberada em produção, bloqueada no teste)
- Cada ambiente grava os formulários no seu próprio banco; o teste nunca alcança o de produção
- Toda página está prerenderizada, sem `{{ }}` no HTML visível
- Título (até 60) e descrição (70 a 155) estão no `<head>`, com canonical
- Nenhum link interno termina em `index.html`
- Os dados estruturados são JSON válido e cobrem todas as páginas
- O React vem do próprio site, com os arquivos esperados
- Nada de fora do site vaza para `out/` (código-fonte, `CNAME`, `.dc.html`)

## Medição (Google Analytics 4 e Search Console)

O que é do repositório, e não da exportação do Claude Design, fica em `scripts/site/` e entra no site pelo build (`scripts/postbuild.mjs`):

- `analytics.js`: aviso de cookies (PT/EN) e Google Analytics 4 (propriedade `intelium.ai`, ID `G-ZTHPL4J2MH`, tag `GTM-W48G224G`). Nada do Google carrega antes de o visitante aceitar. Eventos: `generate_lead` (formulário de contato), `sign_up` (newsletter) e `contact_click` (telefone e e-mail), sem dados pessoais. No site de teste o tráfego vai marcado como `traffic_type=internal`.
- `google7123c91c7fc011d3.html`: prova de propriedade do Search Console (`https://intelium.ai/`). Só vai para produção e não pode ser removido.

Para o visitante rever a escolha de cookies: `InteliumConsent.open()`.
