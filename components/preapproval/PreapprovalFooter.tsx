import { site } from "@/lib/content";
import { licensing, phone } from "@/lib/preapproval";

/**
 * Compliance footer — the checklist from the plan, and nothing else: no link
 * list, no blog, no social icons. License numbers render as "pending" until
 * supplied, and must never be set smaller than the smallest text on the page
 * (B&P 10140.6), which is why this uses the page's 12.5px floor.
 */
export function PreapprovalFooter() {
  const pending = "pending";
  return (
    <footer className="relative z-[1] mx-auto mt-24 max-w-[1240px] border-t border-hairline px-10 pt-10 pb-14 max-mobile:mt-16 max-mobile:px-5">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="flex flex-col gap-2 text-[13.5px] leading-[1.65] text-muted">
          <p className="text-text">{site.name}</p>
          <p>{licensing.address ?? "Street address pending"} &middot; Tracy, CA</p>
          <p>
            <a href={`tel:${phone.tel}`}>{phone.display}</a>
          </p>
        </div>

        <div className="flex items-center gap-3 text-[12.5px] text-muted">
          <EqualHousingIcon />
          <span>
            Equal Housing
            <br />
            Opportunity
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 text-[12.5px] leading-[1.7] text-label">
        <p>
          Real estate broker, California Department of Real Estate. DRE #{" "}
          {licensing.companyDre ?? pending} &middot; NMLS # {licensing.companyNmls ?? pending}{" "}
          &middot; {licensing.agent.name}, DRE # {licensing.agent.dre ?? pending}
          {/* His personal NMLS ID, once known. Until then the company NMLS above
              is the only one shown — never relabelled as his. */}
          {licensing.agent.nmls && <>, NMLS # {licensing.agent.nmls}</>}
        </p>
        <p>
          Dream Home arranges loans through third-party lenders and is not itself the lender.
          Preapproval is not a commitment to lend; all loans are subject to credit review,
          verification and lender approval. Programs and eligibility may change.
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener">
            NMLS Consumer Access
          </a>
          {licensing.privacyHref && <a href={licensing.privacyHref}>Privacy policy</a>}
        </p>
      </div>
    </footer>
  );
}

function EqualHousingIcon() {
  return (
    <svg role="img" aria-label="Equal Housing Opportunity" viewBox="0 0 32 32" className="h-8 w-8 text-muted">
      <path d="M16 3 2.5 12.5v3h2.2V29h22.6V15.5h2.2v-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="10.5" y="16" width="11" height="2.4" fill="currentColor" />
      <rect x="10.5" y="21" width="11" height="2.4" fill="currentColor" />
    </svg>
  );
}
