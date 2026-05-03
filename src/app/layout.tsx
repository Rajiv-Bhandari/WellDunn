import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WellDunn — Project Management",
  description: "A simple project management system built with Next.js, Drizzle, and Auth.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
