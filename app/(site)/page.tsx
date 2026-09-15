import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { FeaturedListings } from "@/components/FeaturedListings";
import { Calculator } from "@/components/Calculator";
import { Process } from "@/components/Process";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { BlogTeasers } from "@/components/BlogTeasers";
import { BookCta } from "@/components/BookCta";
import { faqs } from "@/lib/content";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      {/* Listings and the calculator share one dusk sky. A single band so the
          sky is continuous across both rather than restarting at the seam.
          Everything after the tour returns to black — the page needs somewhere
          for the eye to rest before the form. */}
      <div className="sky-band">
        <FeaturedListings />
        <Calculator />
      </div>
      <Process />
      {/* The shelf, the questions and the blog share a second copy of the same
          sky. Its foot closes to solid, unlike the first band's — what follows
          is the CTA's own dusk scene, not another lit photograph.

          <BookCta> is deliberately outside the band. It carries a drawn dusk
          sky and the roofline that closes the page into the footer, and that
          scene is opaque, so inside the band it occluded the photograph
          entirely; removing it to let the photograph through gains almost
          nothing, because the band's scrim has closed to solid by the depth
          the CTA sits at, and costs the silhouette. */}
      <div className="sky-band" data-tail="solid">
        <Testimonials />
        <Faq />
        <BlogTeasers />
      </div>
      <BookCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
