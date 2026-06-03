import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dongmodel",
  description: "จัดกองโมดอง ของที่ตามหา และแชร์ความสุลต่านแบบไม่โชว์ราคา",
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
