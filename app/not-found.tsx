import type { Metadata } from "next";
import styles from "./not-found.module.css";

// The site pages are static HTML in public/, outside the Next router, so the
// links below are plain anchors. BASE is empty in production and the
// repository sub-folder on GitHub Pages (test environment).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Página não encontrada · Intelium",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={styles.main}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BASE}/assets/isotipo.png`} alt="Intelium" width={40} height={40} />
      <span className={styles.code}>404 · offset fora do tópico</span>
      <h1 className={styles.title}>Página não encontrada.</h1>
      <p className={styles.text}>
        O endereço pode ter mudado ou nunca ter existido. Comece pela página inicial.
      </p>
      <a href={`${BASE}/`} className={styles.btn}>
        Voltar ao início
      </a>
      <p className={styles.text}>
        <a href={`${BASE}/en/`}>Back to home (English)</a>
      </p>
    </main>
  );
}
