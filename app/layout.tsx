import type { Metadata } from "next";
import { Marcellus, Jost, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/content";
import { GOOGLE_ADS_ID } from "@/lib/analytics";

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
      {/* Chrome is per route group: app/(site)/layout.tsx for the main site,
          and each landing page carries its own. */}
      <body>
        {children}

        {/* Google Ads tag, site-wide (lib/analytics.ts explains the one
            conversion it records). The queue and config run before hydration,
            so a page's effects can always call window.gtag. */}
        <Script id="google-ads-init" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
        </Script>
        {/* The library itself loads only in production builds, so local
            development and test submissions never reach the Google Ads
            account. Without it, events simply wait in window.dataLayer. */}
        {process.env.NODE_ENV === "production" && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
