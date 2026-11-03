import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-inter",
});

const title = "Intelium · Novo site em construção";
const description =
  "O centro de excelência em Data Streaming está ganhando um novo site. Arquitetura, entrega e operação de Apache Kafka e Confluent para IA em Tempo Real.";

export const metadata: Metadata = {
  metadataBase: new URL("https://intelium.ai"),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Intelium",
    locale: "pt_BR",
    url: "https://intelium.ai/",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#161826",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
