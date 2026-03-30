import { Footer } from "@/components/layout/Footer";
import { LaunchSignupModal } from "@/components/layout/LaunchSignupModal";
import { Navbar } from "@/components/layout/Navbar";
import { SiteChatWidget } from "@/components/layout/SiteChatWidget";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main id="top" className="cc-site-main pt-[92px] lg:pt-[100px]">
        {children}
      </main>
      <Footer />
      <LaunchSignupModal />
      <SiteChatWidget />
    </>
  );
}
