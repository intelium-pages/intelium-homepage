# intelium.ai · site temporário

Página "em construção" da Intelium, em Next.js 16 com export estático (HTML/CSS/JS puros), pronta para hospedagem compartilhada no Hostinger.

A animação de fluxo de dados (`components/DataFlow.tsx`) é um SVG renderizado no build: streams convergindo na plataforma de streaming e alimentando uma rede neural. Todo o movimento é CSS keyframes + `<animateMotion>`, sem JavaScript no cliente.

## Desenvolvimento

```bash
npm install
npm run dev       # http://localhost:3000
```

## Build

```bash
npm run build     # gera a pasta out/
npm run preview   # serve out/ em http://localhost:4173
npm run package   # build + intelium-site.zip pronto para upload
npm test          # testa o export em out/ (rode o build antes)
```

O CI do GitLab (`.gitlab-ci.yml`) roda build, lint, `npm test` e os scans de segurança em cada push e MR.

## Deploy no Hostinger

O deploy é automático: a cada push na `main`, o Hostinger clona o repositório, roda `npm install` e `npm run build` (Node 22) e publica a pasta `out/` em `public_html/`. As configurações de build ficam no site (tipo de app `react`, isto é, frontend estático; o tipo `next` tentaria subir um servidor, que não existe com `output: "export"`).

### Upload manual (alternativa)

1. `npm run package`
2. hPanel → **Sites** → intelium.ai → **Gerenciador de Arquivos** → `public_html/`
3. Remova o conteúdo antigo de `public_html/` (faça backup antes, se houver algo)
4. Faça upload de `intelium-site.zip` e use **Extrair** dentro de `public_html/`. O `index.html` e o `.htaccess` devem ficar direto na raiz de `public_html/`, não numa subpasta
5. Em **Segurança → SSL**, ative **Forçar HTTPS**

O `public/.htaccess` (copiado para `out/`) configura a página 404, compressão e cache longo para os assets com hash em `_next/static/`.

## Estrutura

```
app/
  layout.tsx          fonte Inter local, metadata pt-BR
  page.tsx            nav, hero, marquee, status e rodapé
  not-found.tsx       404 (vira out/404.html)
  globals.css         tokens de cor da marca
components/
  DataFlow.tsx        animação SVG do fluxo de dados
  BuildStatus.tsx     card de "deploy" com as etapas do novo site
public/
  assets/             logo e isotipo
  .htaccess           config Apache/LiteSpeed do Hostinger
tests/
  export.test.mjs     testes do export estático (node:test)
```

Keyframes usados por CSS Modules ficam no próprio módulo: o Turbopack renomeia nomes de animação dentro de `*.module.css`, então um keyframe global não seria encontrado. Só `dash` e `npulse`, usados em estilos inline do SVG, ficam em `globals.css`.
