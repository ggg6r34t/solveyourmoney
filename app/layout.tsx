import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "./providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3142a9",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://solveyourmoney.com"),
  title: {
    default: "SolveYourMoney | Turn financial chaos into a clear plan",
    template: "%s | SolveYourMoney",
  },
  description:
    "A financial decision coach for young adults: clarity dashboard, paid personalized money plan, and ongoing guidance.",
  applicationName: "SolveYourMoney",
  keywords: [
    "financial decision coach",
    "money plan",
    "young adults",
    "debt payoff",
    "financial clarity",
  ],
  openGraph: {
    title: "SolveYourMoney",
    description: "Turn financial chaos into a clear plan.",
    siteName: "SolveYourMoney",
    type: "website",
    url: "https://solveyourmoney.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "SolveYourMoney",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/180",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === "production" && (
          <Script
            id="sw-registration"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js')`,
            }}
          />
        )}
      </body>
    </html>
  );
}
