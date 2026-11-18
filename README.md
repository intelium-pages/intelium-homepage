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
  publicar.sh         publicação em teste e em produção (npm run publicar:*)
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
- Nada de fora do site vaza para `out/` (código-fonte, `CNAME`, `.dc.html`)
