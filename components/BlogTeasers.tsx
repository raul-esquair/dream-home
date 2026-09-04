import { Reveal } from "./Reveal";
import { posts } from "@/lib/content";

export function BlogTeasers() {
  return (
    <section className="section">
      <Reveal variant="focus">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-10">
          <h2 className="font-display text-[clamp(30px,3vw,42px)] text-text-strong">
            From the blog
          </h2>
          <a href="#" className="text-[15px] whitespace-nowrap">
            All guides &#8594;
          </a>
        </div>
      </Reveal>

      {/* TODO: source from MDX or the CMS. */}
      <div className="grid grid-cols-3 gap-[26px] max-wide:grid-cols-2 max-mobile:grid-cols-1">
        {posts.map((post, i) => (
          <Reveal key={post.title} index={i} variant="focus">
            <a
              href={post.href}
              className="card-flat block h-full rounded-[18px] border border-hairline p-7 hover:-translate-y-1.5 hover:border-[rgba(124,92,196,.45)] hover:bg-[rgba(124,92,196,.07)]"
            >
              <div className="mb-4 font-mono text-[10.5px] tracking-[.2em] text-purple-soft uppercase">
                {post.kicker}
              </div>
              <h3 className="mb-3 font-display text-[22px] leading-[1.35] text-gold-soft">
                {post.title}
              </h3>
              <p className="text-[14.5px] leading-[1.65] text-muted-2">{post.excerpt}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
