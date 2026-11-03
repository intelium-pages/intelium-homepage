import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <Image src="/assets/isotipo.png" alt="Intelium" width={40} height={40} />
      <span className={styles.code}>404 · offset fora do tópico</span>
      <h1 className={styles.title}>Página não encontrada.</h1>
      <p className={styles.text}>O novo site ainda está em construção. Enquanto isso, comece pela página inicial.</p>
      <Link href="/" className={styles.btn}>
        Voltar ao início
      </Link>
    </main>
  );
}
