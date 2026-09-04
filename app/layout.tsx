import type { Metadata } from "next";
import { Marcellus, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { site } from "@/lib/content";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dream Home Real Estate & Home Loans — Tracy, CA",
  description:
    "Real estate and home loans under one roof. We walk first-time buyers through pre-approval, offers and closing across Tracy, Stockton, Lathrop, Patterson and the South & East Bay.",
  openGraph: {
    title: site.name,
    description:
      "Family-run in Tracy, CA since 2013. Book a free consultation with Sonny and Dhruv Goswamy.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${jost.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <BackgroundOrbs />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
