import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notícia — Read smarter",
  description: "Improve your reading comprehension with real news articles and AI-powered questions. Available in Portuguese and Dutch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
