import type { Metadata } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
