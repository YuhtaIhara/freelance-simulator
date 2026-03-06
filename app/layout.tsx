import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "フリーランスシミュレーター",
  description: "個人事業主・フリーランスの手取り年収を計算。国保・国民年金・所得税・住民税・インボイス・節税まで対応（令和7年度版）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.className} antialiased`}>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
