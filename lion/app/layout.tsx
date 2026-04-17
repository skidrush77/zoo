import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-kr",
});

export const metadata: Metadata = {
  title: "🎰 Las Vegas 음주 룰렛",
  description: "라스베가스 스타일 한국 음주 게임 룰렛",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: '#0A0A0F', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
