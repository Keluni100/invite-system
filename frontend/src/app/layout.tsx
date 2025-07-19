import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Management System",
  description: "Enterprise team management with role-based access control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}