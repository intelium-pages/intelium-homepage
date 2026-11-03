import type { CSSProperties, ReactNode } from "react";
import styles from "./DataFlow.module.css";

// Event streams converge on the streaming platform and feed a neural network.
// Rendered on the server: every motion is CSS keyframes or SVG <animateMotion>,
// so the diagram ships with zero client-side JavaScript.

const W = 1200;
const H = 540;
const CY = 270;

const thin: CSSProperties = { stroke: "var(--color-neutral-600)", strokeWidth: 0.8, fill: "none" };
const edge: CSSProperties = { stroke: "var(--color-accent-300)", strokeWidth: 0.7, opacity: 0.22 };
const arrow: CSSProperties = { stroke: "var(--color-accent-300)", strokeWidth: 1.2, fill: "none" };

const streams = Array.from({ length: 12 }, (_, i) => {
  const y = 70 + i * (400 / 11);
  const ey = CY + (y - CY) * 0.13;
  return `M0 ${y.toFixed(1)} C 330 ${y.toFixed(1)}, 360 ${ey.toFixed(1)}, 640 ${ey.toFixed(1)}`;
});

const layers = [
  { x: 700, n: 2, sp: 180 },
  { x: 800, n: 5, sp: 72 },
  { x: 900, n: 7, sp: 62 },
  { x: 1000, n: 5, sp: 72 },
  { x: 1100, n: 3, sp: 84 },
].map((l) => ({ ...l, ys: Array.from({ length: l.n }, (_, j) => CY + (j - (l.n - 1) / 2) * l.sp) }));

const lastLayer = layers.length - 1;

function Dimension({ x1, x2, y, text }: { x1: number; x2: number; y: number; text: string }) {
  return (
    <g>
      <line x1={x1} x2={x2} y1={y} y2={y} style={thin} />
      <line x1={x1} x2={x1} y1={y - 5} y2={y + 5} style={thin} />
      <line x1={x2} x2={x2} y1={y - 5} y2={y + 5} style={thin} />
      <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" className={styles.label}>
        {text}
      </text>
    </g>
  );
}

function Leader({ x1, y1, x2, y2, text, anchor = "start" }: { x1: number; y1: number; x2: number; y2: number; text: string; anchor?: "start" | "end" }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={thin} />
      <text x={x1 + (anchor === "end" ? -6 : 6)} y={y1 + 4} textAnchor={anchor} className={styles.label}>
        {text}
      </text>
    </g>
  );
}

export default function DataFlow() {
  const els: ReactNode[] = [];

  [130, 250, 370, 480].forEach((x) =>
    els.push(<line key={`grid${x}`} x1={x} x2={x} y1={60} y2={500} style={{ ...thin, stroke: "var(--color-neutral-700)", strokeDasharray: "2 6" }} />),
  );

  streams.forEach((d, i) => {
    els.push(<path key={`s${i}`} d={d} style={{ fill: "none", stroke: "url(#dfFade)", strokeWidth: i % 3 === 0 ? 1.4 : 0.8, opacity: 0.55 + (i % 4) * 0.12 }} />);
    if (i % 2 === 0) {
      els.push(
        <path
          key={`sd${i}`}
          d={d}
          style={{
            fill: "none",
            stroke: "var(--color-accent-200)",
            strokeWidth: 1.6,
            strokeLinecap: "round",
            strokeDasharray: "2 28",
            opacity: 0.8,
            animation: `dash ${2.6 + (i % 5) * 0.5}s linear ${-(i * 0.3)}s infinite`,
          }}
        />,
      );
    }
  });

  // Particles riding the streams
  streams.forEach((d, i) => {
    if (i % 3) return;
    els.push(
      <circle key={`p${i}`} r={2.4} className={styles.motion} style={{ fill: "var(--color-accent-100)", filter: "drop-shadow(0 0 4px var(--color-accent))" }}>
        <animateMotion dur={`${3.2 + (i % 5) * 0.6}s`} begin={`${-(i * 0.41)}s`} repeatCount="indefinite" path={d} />
      </circle>,
    );
  });

  // Event envelopes
  [1, 5, 8, 10].forEach((i, n) =>
    els.push(
      <g key={`e${i}`} className={styles.motion}>
        <g transform="translate(-8 -6)">
          <rect width={16} height={12} rx={2} style={{ fill: "var(--color-bg)", stroke: "var(--color-accent-300)", strokeWidth: 1 }} />
          <polyline points="1,1 8,7 15,1" style={{ fill: "none", stroke: "var(--color-accent-300)", strokeWidth: 1 }} />
        </g>
        <animateMotion dur={`${5 + n * 0.7}s`} begin={`${-(n * 1.3)}s`} repeatCount="indefinite" path={streams[i]} />
      </g>,
    ),
  );

  // Streaming platform chip
  els.push(
    <g key="chip" transform={`translate(118 ${CY - 19})`}>
      <rect width={116} height={38} rx={8} style={{ fill: "var(--color-surface)", stroke: "var(--color-accent-700)", strokeWidth: 1 }} />
      <circle cx={20} cy={19} r={4} style={{ fill: "var(--color-accent)", animation: "npulse 1.6s ease-in-out infinite" }} />
      <text x={34} y={24} className={styles.chip}>
        Confluent
      </text>
    </g>,
  );

  // Arrows into the network
  [-36, -18, 0, 18, 36].forEach((dy) => {
    const y = CY + dy;
    els.push(<line key={`ai${dy}`} x1={606} x2={650} y1={y} y2={y} style={{ ...arrow, opacity: 0.8 }} />);
    els.push(<polyline key={`ah${dy}`} points={`644,${y - 4} 651,${y} 644,${y + 4}`} style={arrow} />);
  });

  // Network edges
  layers[0].ys.forEach((y, j) => els.push(<line key={`e0-${j}`} x1={652} y1={CY} x2={layers[0].x} y2={y} style={edge} />));
  layers.slice(0, -1).forEach((l, li) =>
    l.ys.forEach((y1, a) =>
      layers[li + 1].ys.forEach((y2, b) => els.push(<line key={`e${li}-${a}-${b}`} x1={l.x} y1={y1} x2={layers[li + 1].x} y2={y2} style={edge} />)),
    ),
  );

  // Arrows out of the network
  layers[lastLayer].ys.forEach((y, j) => {
    els.push(<line key={`ao${j}`} x1={1112} x2={1168} y1={y} y2={y} style={arrow} />);
    els.push(<polyline key={`aoh${j}`} points={`1162,${y - 4} 1170,${y} 1162,${y + 4}`} style={arrow} />);
  });

  // Nodes: the output layer is still "under construction" (dashed, spinning rings)
  layers.forEach((l, li) =>
    l.ys.forEach((y, j) => {
      const anim = `npulse 2.8s ease-in-out ${(li * 0.35 + j * 0.04).toFixed(2)}s infinite`;
      const building = li === lastLayer;
      els.push(
        <g key={`n${li}-${j}`}>
          <circle cx={l.x} cy={y} r={24} style={{ fill: "url(#dfGlow)", animation: anim }} />
          <circle
            cx={l.x}
            cy={y}
            r={10}
            className={building ? styles.building : undefined}
            style={{ fill: "var(--color-bg)", stroke: "var(--color-accent-300)", strokeWidth: 1.2, strokeDasharray: building ? "3 3" : undefined }}
          />
          <circle cx={l.x} cy={y} r={building ? 4 : 6} style={{ fill: "var(--color-accent-200)", animation: anim }} />
        </g>,
      );
    }),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Fluxos de eventos convergindo na plataforma de streaming e alimentando um modelo de IA em tempo real"
      className={styles.svg}
    >
      <defs>
        <linearGradient id="dfFade" x1={0} x2={1} y1={0} y2={0}>
          <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
          <stop offset=".3" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.5 }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent-200)", stopOpacity: 0.95 }} />
        </linearGradient>
        <radialGradient id="dfGlow">
          <stop offset="0" style={{ stopColor: "var(--color-accent-200)", stopOpacity: 0.7 }} />
          <stop offset="1" style={{ stopColor: "var(--color-accent-200)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <Dimension x1={250} x2={600} y={44} text="PIPELINE DE DADOS" />
      <Dimension x1={250} x2={600} y={512} text="EVENTOS EM MOVIMENTO" />
      <Dimension x1={660} x2={1130} y={18} text="FLUXO DE INTELIGÊNCIA EM TEMPO REAL" />
      <Dimension x1={760} x2={1020} y={528} text="ATIVAÇÃO DE NÓS" />
      {els}
      <Leader x1={1036} y1={100} x2={1008} y2={128} text="ENTRADA DO MODELO DE IA" />
      <Leader x1={1080} y1={440} x2={1096} y2={372} text="EM CONSTRUÇÃO" anchor="end" />
      <line x1={1188} x2={1188} y1={96} y2={444} style={thin} />
      <text x={1196} y={CY} textAnchor="middle" transform={`rotate(90 1196 ${CY})`} className={styles.label}>
        INTELIGÊNCIA EM TEMPO REAL
      </text>
    </svg>
  );
}
