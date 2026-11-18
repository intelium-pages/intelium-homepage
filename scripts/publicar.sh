#!/usr/bin/env bash
# Publicação do site da Intelium em dois passos: teste (GitHub Pages) e
# produção (GitLab -> Hostinger). Uso, sempre pela raiz do repositório:
#
#   npm run publicar:teste -- "mensagem do commit"   # valida e publica no GitHub Pages
#   npm run publicar:prd                             # abre o MR de produção no GitLab
#   npm run publicar:sync                            # depois do merge, iguala os dois repositórios
#
# Regras que o script garante:
#   - nada vai para o GitLab sem ter passado pelo GitHub (mesmo commit);
#   - nada é publicado sem lint, build e testes nos modos produção e teste;
#   - a main do GitLab nunca recebe push direto: produção é sempre por MR;
#   - o sync só leva para o GitHub o que já está em produção.

set -euo pipefail
cd "$(dirname "$0")/.."

TEST_URL="https://intelium-pages.github.io/intelium-homepage/"
ACTIONS_URL="https://github.com/intelium-pages/intelium-homepage/actions"
EXPORT_DIR=".export"

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31mERRO: %s\033[0m\n' "$*" >&2; exit 1; }

for remote in github gitlab; do
  git remote get-url "$remote" >/dev/null 2>&1 || fail "remote '$remote' não configurado (veja o README)."
done

# Traz as duas origens e deixa a main local igual à do GitLab (base de produção),
# mantendo por cima o que ainda só está no teste.
sync_main() {
  say "Atualizando a partir do GitHub e do GitLab"
  git fetch --quiet --prune github
  git fetch --quiet --prune gitlab
  local branch; branch="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$branch" != "main" ]; then
    # Adianta a main antes de trocar de branch, para as mudanças em andamento irem junto.
    git fetch --quiet . gitlab/main:main 2>/dev/null || true
    git fetch --quiet . github/main:main 2>/dev/null || true
    git checkout --quiet main 2>/dev/null || fail "não consegui trocar para a main (há mudanças em conflito na branch '$branch')."
  fi
  for ref in gitlab/main github/main; do
    if git merge-base --is-ancestor main "$ref"; then
      git merge --quiet --ff-only "$ref"
    elif ! git merge-base --is-ancestor "$ref" main; then
      fail "a main local e '$ref' divergiram. Se o MR foi aceito com squash, rode: npm run publicar:sync. Senão, não force nada e peça ajuda."
    fi
  done
}

# Se o MR foi aceito com "squash", a main do GitLab ganha um commit novo com o
# mesmo conteúdo e os históricos deixam de bater. Quando o conteúdo é idêntico
# e não há nada pendente, adota a main do GitLab aqui e no GitHub.
realign_after_squash() {
  git fetch --quiet --prune github
  git fetch --quiet --prune gitlab
  git merge-base --is-ancestor main gitlab/main && return 0
  git merge-base --is-ancestor gitlab/main main && return 0
  [ -z "$(git status --porcelain)" ] || return 0
  [ "$(git rev-parse main)" = "$(git rev-parse github/main)" ] || return 0
  git diff --quiet main gitlab/main || return 0
  say "O MR foi aceito com squash: realinhando com a main do GitLab (mesmo conteúdo)"
  [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || git checkout --quiet main
  git reset --quiet --hard gitlab/main
  git push --quiet --force-with-lease=main:github/main github main
  git fetch --quiet github
}

# Se houver uma exportação nova em .export/ (zip ou pasta), aplica em public/.
apply_export() {
  [ -d "$EXPORT_DIR" ] || return 0
  local src="" tmp=""
  local zip; zip="$(find "$EXPORT_DIR" -maxdepth 1 -name '*.zip' | head -n 1)"
  if [ -n "$zip" ]; then
    tmp="$(mktemp -d)"
    unzip -oq "$zip" -d "$tmp"
    src="$tmp"
  else
    src="$EXPORT_DIR"
  fi
  local index; index="$(find "$src" -maxdepth 3 -name sitemap.xml -not -path '*/node_modules/*' | head -n 1)"
  [ -n "$index" ] || { [ -n "$tmp" ] && rm -rf "$tmp"; return 0; }
  say "Aplicando a exportação nova em public/"
  node scripts/sync-site.mjs "$(dirname "$index")"
  rm -rf "$EXPORT_DIR"
  [ -n "$tmp" ] && rm -rf "$tmp"
  return 0
}

# Refaz os snapshots de prerender quando há Playwright nesta máquina. Sem ele,
# segue adiante: os testes acusam se algum snapshot estiver desatualizado.
prerender() {
  if node -e "require.resolve('playwright')" >/dev/null 2>&1 || node -e "require.resolve('playwright-core')" >/dev/null 2>&1; then
    say "Prerender das páginas"
    node scripts/prerender.mjs
  fi
}

validate() {
  prerender
  say "Lint"
  npm run --silent lint
  say "Build e testes no modo produção"
  SITE_ENV=prd npm run --silent build
  SITE_ENV=prd npm test --silent
  say "Build e testes no modo teste (noindex)"
  SITE_ENV=dsv npm run --silent build
  SITE_ENV=dsv npm test --silent
}

cmd_teste() {
  local msg="${1:-content: atualização do site $(date +%Y-%m-%d)}"
  sync_main
  apply_export
  if [ -z "$(git status --porcelain)" ] && [ "$(git rev-parse main)" = "$(git rev-parse github/main)" ]; then
    say "Nada novo para publicar no teste."
    exit 0
  fi
  validate
  if [ -n "$(git status --porcelain)" ]; then
    say "Commit"
    git add -A
    git commit --quiet -m "$msg"
    git --no-pager log --oneline -1
  fi
  say "Enviando para o GitHub (teste)"
  git push --quiet github main
  printf '\nPublicando no ambiente de teste. Em ~2 minutos:\n  site:     %s\n  pipeline: %s\n\nConfira links e imagens. Estando certo: npm run publicar:prd\n' "$TEST_URL" "$ACTIONS_URL"
}

cmd_prd() {
  sync_main
  [ -z "$(git status --porcelain)" ] || fail "há mudanças não publicadas no teste. Rode antes: npm run publicar:teste"
  [ "$(git rev-parse main)" = "$(git rev-parse github/main)" ] || fail "a main local não é a que está no teste. Rode antes: npm run publicar:teste"
  if [ "$(git rev-parse main)" = "$(git rev-parse gitlab/main)" ]; then
    say "Produção já está igual ao teste. Nada a promover."
    exit 0
  fi
  local title; title="$(git log -1 --format=%s main)"
  # MR de release ainda aberto: se já tem esta versão, não há o que fazer;
  # se tem uma versão anterior, atualiza o mesmo MR em vez de abrir outro.
  local ref branch=""
  for ref in $(git for-each-ref --format='%(refname:short)' 'refs/remotes/gitlab/release/'); do
    git merge-base --is-ancestor "$ref" gitlab/main && continue
    [ "$(git rev-parse "$ref")" != "$(git rev-parse main)" ] || fail "já existe um MR aberto com esta versão (${ref#gitlab/}). Faça o merge no GitLab e rode: npm run publicar:sync"
    if git merge-base --is-ancestor "$ref" main; then branch="${ref#gitlab/}"; fi
  done
  say "Commits que vão para produção"
  git --no-pager log --oneline gitlab/main..main
  if [ -n "$branch" ]; then
    say "Atualizando o MR que já está aberto ($branch)"
    git push gitlab "main:refs/heads/$branch"
    printf '\nMR atualizado com a versão nova. O merge publica no intelium.ai.\nDepois do merge: npm run publicar:sync\n'
    return 0
  fi
  branch="release/$(date +%Y%m%d-%H%M)"
  say "Abrindo o MR no GitLab ($branch)"
  git push \
    -o merge_request.create \
    -o merge_request.target=main \
    -o merge_request.remove_source_branch \
    -o "merge_request.title=$title" \
    gitlab "main:refs/heads/$branch"
  printf '\nMR aberto (link acima). O merge publica no intelium.ai.\nDepois do merge: npm run publicar:sync\n'
}

cmd_sync() {
  realign_after_squash
  sync_main
  if [ "$(git rev-parse main)" != "$(git rev-parse github/main)" ]; then
    # Só leva para o GitHub o que já está em produção. Commits locais que não
    # passaram pela validação vão pelo publicar:teste, nunca por aqui.
    if [ "$(git rev-parse main)" = "$(git rev-parse gitlab/main)" ]; then
      say "Levando a main de produção para o GitHub"
      git push --quiet github main
    else
      fail "há commits locais que não passaram pelo teste. Rode: npm run publicar:teste"
    fi
  fi
  say "Estado"
  printf 'local  %s\ngithub %s\ngitlab %s\n' "$(git rev-parse --short main)" "$(git rev-parse --short github/main)" "$(git rev-parse --short gitlab/main)"
  if [ "$(git rev-parse main)" = "$(git rev-parse gitlab/main)" ] && [ "$(git rev-parse main)" = "$(git rev-parse github/main)" ]; then
    echo "Os dois repositórios estão iguais."
  else
    echo "Há commits no teste que ainda não foram para produção (npm run publicar:prd)."
  fi
}

case "${1:-}" in
  teste) shift; cmd_teste "${1:-}" ;;
  prd)   cmd_prd ;;
  sync)  cmd_sync ;;
  *)     grep '^#' "$0" | sed -n '2,12p' | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
