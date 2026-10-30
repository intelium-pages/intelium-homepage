import Head from 'next/head';

export default function NotFound() {
  return (
    <main style={{ margin: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '0 8vw', background: '#161826', color: '#e9e9ed', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Head>
        <title>Página não encontrada · Intelium</title>
        <meta name="robots" content="noindex" />
        <style>{'body{margin:0;background:#161826}a{color:#b9b1ec}'}</style>
      </Head>
      <h1 style={{ fontWeight: 500, margin: 0 }}>Página não encontrada</h1>
      <p style={{ margin: 0 }}><a href="/">Voltar ao início</a> · <a href="/en/">Back to home</a></p>
    </main>
  );
}
