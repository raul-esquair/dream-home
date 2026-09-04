/**
 * Fixed, non-interactive backdrop: two large blurred radial orbs that drift.
 * Sits at z-0 behind all content.
 */
export function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="animate-orbit absolute -top-[180px] -left-[140px] h-[620px] w-[620px] rounded-full blur-[30px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,196,.28), transparent 65%)",
        }}
      />
      <div
        className="animate-orbit absolute -right-[160px] -bottom-[260px] h-[700px] w-[700px] rounded-full blur-[40px] [animation-direction:reverse] [animation-duration:28s]"
        style={{
          background:
            "radial-gradient(circle, rgba(201,162,39,.18), transparent 65%)",
        }}
      />
    </div>
  );
}
