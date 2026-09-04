import { SettleIn } from "./SettleIn";
import { Scene } from "./scene/Scene";
import { BookTrigger } from "./BookDialog";
import { publishedContact, site } from "@/lib/content";

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-[14px]">
      {/* --color-label measures 3.53 against the lit vanity behind it; the
          lighter token takes the same spot to 5.27. */}
      <span className="min-w-[78px] font-mono text-[10.5px] tracking-[.18em] text-muted-2 uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

export function BookCta() {
  return (
    <Scene className="z-[1] pt-[110px] pb-[190px] max-mobile:pt-[72px] max-mobile:pb-[110px]">
      <section id="book" className="relative z-10 mx-auto max-w-[1400px] px-10 max-mobile:px-5">
      {/* Arrives as one object, the same settle the affordability card uses —
          see <SettleIn>. It replaces the <Reveal> that used to wrap this
          block: layering the two makes the copy arrive after its own panel. */}
      <SettleIn className="cta-card relative grid grid-cols-[1.05fr_.95fr] items-center gap-14 overflow-hidden rounded-[30px] border border-[rgba(233,200,119,.24)] p-16 max-mobile:grid-cols-1 max-mobile:p-[26px]">
          <div
            aria-hidden
            className="animate-orbit absolute -top-[140px] -right-[80px] h-[420px] w-[420px] rounded-full blur-[30px] [animation-duration:20s]"
            style={{
              background: "radial-gradient(circle, rgba(201,162,39,.28), transparent 65%)",
            }}
          />

          <div className="relative">
            <h2 className="mb-5 font-display text-[clamp(36px,3.8vw,54px)] leading-[1.08] tracking-[-.015em] text-text-strongest">
              Let&#8217;s talk about your first home.
            </h2>
            <p className="mb-[30px] max-w-[460px] text-[17.5px] leading-[1.65] text-muted-3">
              No pitch, no obligation. Just the two people who handle both the house and the
              loan, from your first question through to the keys.
            </p>

            <div className="flex flex-col gap-[14px] text-[15.5px] text-nav">
              <ContactRow label={publishedContact.name}>
                <a href={`mailto:${publishedContact.email}`}>{publishedContact.email}</a>
              </ContactRow>
              <ContactRow label="Office">
                <span>{site.city}</span>
              </ContactRow>
            </div>
          </div>

          {/* The form now lives in the dialog, so this column carries the
              invitation instead of the fields. */}
          <div data-material className="relative flex flex-col items-center gap-[18px] rounded-[22px] border border-[rgba(233,200,119,.22)] bg-[rgba(10,9,13,.72)] px-[34px] py-[44px] text-center backdrop-blur-[14px]">
            <p className="text-balance font-display text-[24px] leading-[1.28] text-text-strongest">
              Not sure you&#8217;re ready? That&#8217;s the call.
            </p>
            <p className="max-w-[410px] text-[15px] leading-[1.65] text-muted-2">
              You don&#8217;t need a budget worked out, a pre-approval, or a house you like
              yet. Twenty minutes with Sonny or Dhruv and you&#8217;ll know roughly what you
              can afford, what it would cost monthly, and what to fix first.
            </p>
            <BookTrigger className="btn-gold mt-[6px] w-full cursor-pointer rounded-full py-[17px] text-[16px] font-semibold hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(201,162,39,.3)]">
              Book a free consultation
            </BookTrigger>
            <p className="max-w-[410px] text-[13px] leading-[1.6] text-muted-2">
              Free, no obligation, and buyer representation is typically paid at closing.
              Sonny or Dhruv replies within one business day &#8212; not a call center.
            </p>
          </div>
      </SettleIn>
      </section>
    </Scene>
  );
}
