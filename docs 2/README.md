# intelium-homepage

Site institucional da Intelium (PT-BR e EN). Páginas estáticas, sem build.

## Estrutura
- `/` e `/en/` · início
- `/sobre/`, `/servicos/`, `/cases/`, `/eventos/`, `/labs/`, `/academy/`, `/contato/` (e equivalentes em `/en/`)
- `/assets/` · imagens, logo, estilos (`assets/ds/`)
- `support.js` · runtime das páginas
- `sitemap.xml`, `robots.txt`, `404.html`

## Publicação
GitHub Pages: Settings → Pages → Deploy from branch → `main` / `/docs`. Para domínio próprio, adicione o arquivo `CNAME` com o domínio.

## Pendências
- Formulário de contato precisa de destino (e-mail/CRM/form service).
- Domínio usado em canonical/sitemap: https://intelium.ai — trocar se for outro.
