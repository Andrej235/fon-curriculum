import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Roboto, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { baseUrl } from "@/lib/base-url";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raspored Predavanja za Fon",
  description:
    "Jednostavan i pregledan raspored predavanja (časova) za Fakultet organizacionih nauka, omogućava i automatsko (po grupama) i ručno kreiranje rasporeda",
  metadataBase: new URL(baseUrl),

  applicationName: "Raspored Predavanja za Fon",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  keywords: [
    "raspored predavanja",
    "raspored časova",
    "Fakultet organizacionih nauka",
    "Fon",
    "beogradski univerzitet",
    "raspored po grupama",
  ],
  category: "Education",

  openGraph: {
    title: "Raspored Predavanja za Fon",
    description:
      "Jednostavan i pregledan raspored predavanja (časova) za Fakultet organizacionih nauka",
    url: baseUrl,
    siteName: "Raspored Predavanja za Fon",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raspored Predavanja za Fon - Open Graph Image",
      },
    ],
    locale: "sr_RS",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Raspored Predavanja za Fon",
    description:
      "Jednostavan i pregledan raspored predavanja (časova) za Fakultet organizacionih nauka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raspored Predavanja za Fon - Twitter Card Image",
      },
    ],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="select-none">
      <body className={`${roboto.variable} ${robotoSlab.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster richColors />
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
