import type { Metadata } from "next";
import Script from "next/script";
import { Barlow_Condensed, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const GTM_ID = "GTM-P7F6FKQX";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Leos Trading FZE — OEM Parts, Industrial Equipment & Global Sourcing",
  description:
    "UAE-based global supplier of OEM and aftermarket parts for trucks, construction equipment, generators, mining and marine applications. Search available stock or request global sourcing.",
  // "./" = each page's own URL (without ?filters), so search engines index one clean version of every page.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AE",
    title: "Leos Trading FZE — OEM Parts, Machinery & Global Sourcing from the UAE",
    description:
      "OEM and aftermarket parts, new and used machinery, trucks and forklifts — in stock or sourced to order, with export from the UAE.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </body>
    </html>
  );
}
