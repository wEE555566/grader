import "./globals.css";

export const metadata = {
  title: "Nexus Grader | Premium C++ Platform",
  description: "Advanced grading platform with beautiful dynamic UI",
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
