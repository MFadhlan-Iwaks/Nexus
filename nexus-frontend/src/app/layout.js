import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CenterAlertProvider from "@/components/common/CenterAlertProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NEXUS — Sistem Informasi Kebencanaan BPBD",
  description:
    "NEXUS: Network for Emergency & eXtraordinary Unified Services. Platform crowdsourcing berbasis relawan untuk keputusan darurat kebencanaan.",
  keywords: "BPBD, kebencanaan, TRC, laporan bencana, peringatan dini, logistik, faskes",
  authors: [{ name: "NEXUS Dev Team" }],
  openGraph: {
    title: "NEXUS — Sistem Informasi Kebencanaan",
    description: "Platform pusat komando kebencanaan untuk BPBD.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CenterAlertProvider>{children}</CenterAlertProvider>
      </body>
    </html>
  );
}
