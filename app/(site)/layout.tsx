import { Footer } from "@/components/layout/Footer";
import { LaunchSignupModal } from "@/components/layout/LaunchSignupModal";
import { Navbar } from "@/components/layout/Navbar";
import { SiteChatWidget } from "@/components/layout/SiteChatWidget";
import { SiteSessionProvider } from "./site-session-provider";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteSessionProvider>
      <a
        href="#main-content"
        className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-[10060] inline-flex -translate-y-[200%] rounded-md border border-burgundy bg-cream px-4 py-2 font-body text-sm font-normal text-burgundy shadow-nav transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-burgundy/35"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        className="cc-site-main pt-[92px] lg:pt-[100px]"
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      <LaunchSignupModal />
      <SiteChatWidget />
    </SiteSessionProvider>
  );
}
