import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { ToastProvider } from "@/components/common/Toast";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Du lịch mọi nơi",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body
        className={`${manrope.variable} ${sora.variable} min-h-dvh bg-white font-sans text-gray-900 antialiased`}
      >
        <ToastProvider>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <ChatWidget />
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
