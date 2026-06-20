import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CEDT Grader",
  description: "Auto-Grading Platform for CEDT",
  icons: {
    icon: "/FavoriteIcon.jpg",
    shortcut: "/FavoriteIcon.jpg",
    apple: "/FavoriteIcon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
