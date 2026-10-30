import { NextResponse } from 'next/server';

// Rotas de pasta (/sobre/) servem public/sobre/index.html.
// Sem barra final (/sobre) → 308 para /sobre/, pois os HTMLs usam caminhos relativos.
export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  if (!pathname.endsWith('/')) {
    // URL simples (não NextURL): o NextURL remove a barra final ao serializar e gera loop.
    return NextResponse.redirect(new URL(pathname + '/' + req.nextUrl.search, req.url), 308);
  }
  const url = req.nextUrl.clone();
  url.pathname = pathname + 'index.html';
  return NextResponse.rewrite(url);
}

export const config = { matcher: ['/((?!_next/|api/).*)'] };
