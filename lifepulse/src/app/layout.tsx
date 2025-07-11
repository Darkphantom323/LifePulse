import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LifePulse - Your Health & Wellness Companion",
  description: "Track your health goals, hydration, meditation, and daily schedule with LifePulse.",
};

// Loading component for better UX
function PageLoader() {
  return (
    <div className="animate-pulse p-8 min-h-screen bg-gray-50">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          <div className="h-full flex bg-gray-50">
            <Navigation />
            <div className="lg:pl-72 w-full bg-gray-50">
              <main className="flex-1 overflow-auto bg-gray-50">
                <div className="px-6 py-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
                  <Suspense fallback={<PageLoader />}>
                    {children}
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
