import Image from "next/image";
import BuildStatus from "@/components/BuildStatus";
import DataFlow from "@/components/DataFlow";
import styles from "./page.module.css";

const stack = [
  "Apache Kafka",
  "Confluent Cloud",
  "Confluent Platform",
  "Apache Flink",
  "ksqlDB",
  "Kafka Connect",
  "Schema Registry",
  "Tableflow",
  "Apache Iceberg",
  "IBM",
  "TD Synnex",
  "Lenses.io",
];

const EMAIL = "contato@intelium.ai";

export default function Home() {
  return (
    <>
      <nav className={styles.nav}>
        <a href="#topo" className={styles.brand}>
          <Image src="/assets/logo.png" alt="Intelium" width={156} height={24} priority />
        </a>
        <a href={`mailto:${EMAIL}`} className={styles.btn}>
          Fale conosco
        </a>
      </nav>

      <main>
        <header id="topo" className={styles.hero}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.intro}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Novo site em construção
            </span>
            <h1 className={styles.title}>
              <span className={styles.line}>Estamos construindo</span>
              <span className={`${styles.line} ${styles.accent}`}>o novo intelium.ai.</span>
            </h1>
            <div className={styles.lede}>
              <p>
                O centro de excelência em Data Streaming está ganhando um novo site. Enquanto finalizamos os últimos
                detalhes, nossos dados seguem em movimento: arquitetura, entrega e operação de Apache Kafka e
                Confluent para IA em Tempo Real.
              </p>
              <span className={styles.meta}>Em breve · São Paulo · Global</span>
            </div>
          </div>
          <div className={styles.diagram}>
            <DataFlow />
          </div>
        </header>

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...stack, ...stack].map((name, i) => (
              <span key={i} className={styles.marqueeItem}>
                {name}
                <span className={styles.marqueeDot} />
              </span>
            ))}
          </div>
        </div>

        <section className={styles.status}>
          <div className={styles.statusCopy}>
            <span className={styles.eyebrow}>Status do deploy</span>
            <h2 className={styles.h2}>Cada evento no seu lugar. O site também.</h2>
            <p>
              Precisa falar com o CoE agora? Arquitetura, implementação, migração e licenciamento IBM Confluent
              seguem a todo vapor.
            </p>
            <div className={styles.ctas}>
              <a href={`mailto:${EMAIL}`} className={`${styles.btn} ${styles.btnLg}`}>
                {EMAIL}
              </a>
              <a href="https://www.linkedin.com/company/inteliumai/" target="_blank" rel="noopener" className={styles.link}>
                LinkedIn ↗
              </a>
            </div>
          </div>
          <BuildStatus />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image src="/assets/isotipo.png" alt="" width={40} height={40} />
            <span>CoE Intelium.ai</span>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.eyebrowMuted}>Contato</span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href="tel:+551128448000">+55 (11) 2844-8000</a>
            <a href="https://www.linkedin.com/company/inteliumai/" target="_blank" rel="noopener">
              LinkedIn ↗
            </a>
            <a href="https://www.youtube.com/@inteliumai" target="_blank" rel="noopener">
              YouTube ↗
            </a>
          </div>
          <div className={styles.footerCol}>
            <span className={styles.eyebrowMuted}>Endereço</span>
            <span>
              Av. Pres. Juscelino Kubitschek, 2041, Bloco B
              <br />
              São Paulo · SP · Brasil
            </span>
          </div>
        </div>
        <p className={styles.copy}>© 2026 Intelium. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
