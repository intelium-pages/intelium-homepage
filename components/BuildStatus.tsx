import styles from "./BuildStatus.module.css";

type Status = "done" | "active" | "next";

const stages: { n: string; name: string; sub: string; status: Status }[] = [
  { n: "01", name: "Arquitetura", sub: "topologia e fluxos", status: "done" },
  { n: "02", name: "Design system", sub: "identidade e componentes", status: "done" },
  { n: "03", name: "Conteúdo", sub: "serviços, cases e labs", status: "active" },
  { n: "04", name: "Lançamento", sub: "intelium.ai", status: "next" },
];

const statusText: Record<Status, string> = {
  done: "concluído",
  active: "em andamento",
  next: "em breve",
};

export default function BuildStatus() {
  return (
    <section className={styles.card} aria-label="Status do novo site">
      <div className={styles.head}>
        <span className={styles.topic}>prd.intelium.site.deploy.v2</span>
        <span className={styles.live}>
          <span className={styles.dot} aria-hidden="true" />
          building
        </span>
      </div>
      <div className={styles.track} aria-hidden="true">
        {[0, 1, 2].map((j) => (
          <span key={j} className={styles.packet} style={{ animationDelay: `${j * 1.2}s` }} />
        ))}
      </div>
      <ol className={styles.stages}>
        {stages.map((s) => (
          <li key={s.n} className={styles.stage} data-status={s.status}>
            <span className={styles.n}>{s.n}</span>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.sub}>{s.sub}</span>
            <span className={styles.state}>{statusText[s.status]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
