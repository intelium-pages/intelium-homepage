# Intelium — site (Next.js)

O site é servido como HTML estático a partir de `public/` (gerado das páginas `.dc.html`). O Next.js só roteia: `/sobre/` → `public/sobre/index.html`, `/sobre` → 308 para `/sobre/`.

## Rodar
```
npm install
npm run build
npm start        # usa a variável PORT (padrão 3000)
```

## Hostinger (Node.js app)
- Node 18.18+ (recomendado 20 ou 22)
- Install: `npm install` · Build: `npm run build` · Start: `npm start`
- Diretório raiz da aplicação: esta pasta (`nextjs/`)

## Atualizar conteúdo
Substituir `public/` pelo conteúdo novo de `docs/` (sem `.nojekyll` e `README.md`).
