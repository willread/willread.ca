import type { Metadata } from "next";
import { TerminalProvider } from "@/lib/terminal";
import "./globals.css";

export const metadata: Metadata = {
  title: "C:\\WILL>",
  description: "Will's personal homepage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TerminalProvider>{children}</TerminalProvider>
      </body>
    </html>
  );
}
