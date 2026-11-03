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
```

## Deploy no Hostinger

> **Atenção:** intelium.ai tem o deploy automático do Git ativo no Hostinger para a branch `main` deste repositório. Ele copia o repositório do jeito que está para `public_html/`, sem rodar o build. Com o código Next.js na `main`, o push publicaria o código-fonte em vez do site. Antes do merge, desative esse deploy automático no hPanel (ou troque por um deploy que rode `npm run build` e publique `out/`) e use o upload manual abaixo.

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
```

Keyframes usados por CSS Modules ficam no próprio módulo: o Turbopack renomeia nomes de animação dentro de `*.module.css`, então um keyframe global não seria encontrado. Só `dash` e `npulse`, usados em estilos inline do SVG, ficam em `globals.css`.
