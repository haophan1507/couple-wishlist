type AdminContentFallbackProps = {
  title: string;
  description?: string;
};

export function AdminContentFallback({ title, description }: AdminContentFallbackProps) {
  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">{description}</p>
        ) : null}
        <div className="mt-4 h-36 animate-pulse rounded-2xl bg-blush/60 dark:bg-white/10" />
      </section>
      <section className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card h-28 animate-pulse bg-blush/40 dark:bg-white/5" />
        ))}
      </section>
    </>
  );
}
