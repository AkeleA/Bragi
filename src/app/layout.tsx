import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { Providers } from "@/components/Providers";
// @ts-expect-error: CSS import type declarations are handled by Next.js
import "./globals.css";

export const metadata: Metadata = {
  title: "Bragi",
  description: "Edit short videos and schedule them across social channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app-shell">
            <AppHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
