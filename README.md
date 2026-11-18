# intelium.ai · site institucional

Site da Intelium (PT-BR e EN, 62 páginas) em Next.js 16 com export estático. O mesmo código é publicado em dois ambientes:

| | Teste (DSV) | Produção (PRD) |
|---|---|---|
| Repositório | GitHub `intelium-pages/intelium-homepage` | GitLab `excelium-tech/internal/intelium-website` |
| Endereço | https://intelium-pages.github.io/intelium-homepage/ | https://intelium.ai |
| Quem publica | GitHub Actions (`.github/workflows/pages.yml`) | Hostinger, a cada push na `main` |
| Buscadores | bloqueados (`noindex` + `robots.txt` Disallow) | liberados |

Os dois repositórios têm os mesmos commits. **Toda mudança passa primeiro pelo GitHub** e só depois vai para o GitLab.

## De onde vem o conteúdo

As páginas são desenhadas no Claude Design e exportadas como HTML estático. Elas ficam em `public/` e o Next apenas as copia para `out/`. **Não edite as páginas à mão em `public/`**: a próxima exportação apaga a mudança.

Para atualizar o conteúdo com uma exportação nova:

```bash
npm run sync-site -- /caminho/da/exportacao/docs
npm run build && npm test
```

O `sync-site` preserva o `public/.htaccess` e as imagens da página 404, e ignora `CNAME`, `README.md`, `.nojekyll` e `404.html` da exportação.

## Fluxo de publicação

```bash
# 1. Teste: publica no GitHub Pages
git push github main

# 2. Confira links e imagens em https://intelium-pages.github.io/intelium-homepage/

# 3. Produção: o mesmo commit, por merge request
git push gitlab main:feat/minha-mudanca
#    abra o MR no GitLab; o merge na main dispara o deploy na Hostinger
```

Um push direto na `main` do GitLab publica em produção na hora. Use sempre MR.

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

- `SITE_ENV=dsv`: depois do build, `scripts/postbuild.mjs` troca o `robots.txt` por `Disallow: /` e inclui `noindex, nofollow` em todas as páginas de `out/`.
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
- Nada de fora do site vaza para `out/` (código-fonte, `CNAME`, `.dc.html`)
