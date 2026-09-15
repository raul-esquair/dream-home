import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";

/**
 * Chrome for the main site. It lives in a route group rather than the root
 * layout so the ad landing pages (`/preapproval`) can opt out of the nav,
 * footer link list and booking bar — a landing page with an exit menu leaks
 * the paid click it exists to convert.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <BackgroundOrbs />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBar />
    </>
  );
}
