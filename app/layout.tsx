import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { NetworkProvider } from "@/lib/context/NetworkContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LogiSync Pro — AI-Driven Logistics Management for Indian MSMEs",
  description: "Enterprise logistics, fleet monitoring, route AI, and warehouse visibility platform tailored for Indian MSMEs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-primary text-neutral-900 font-sans min-h-screen antialiased selection:bg-brand-50 selection:text-brand-600">
        <AuthProvider>
          <NetworkProvider>{children}</NetworkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
