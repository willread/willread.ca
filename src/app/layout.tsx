import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import { TerminalProvider } from "@/lib/terminal";
import DosScreen from "@/components/DosScreen";
import "./globals.css";

const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-dos" });

export const metadata: Metadata = {
  title: "will://",
  description: "Will's personal homepage",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={vt323.variable}>
      <body>
        <TerminalProvider>
          <DosScreen>{children}</DosScreen>
        </TerminalProvider>
      </body>
    </html>
  );
}
