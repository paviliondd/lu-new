export default function ArticleLoading() {
  return (
    <div className="theme-page w-full py-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,740px)_16.5rem] lg:justify-center">
        <article className="space-y-6">
          <div className="space-y-4">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-11/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="flex gap-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          <div className="aspect-[2/1] w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-9/12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </article>

        <aside className="hidden space-y-3 lg:block">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </aside>
      </div>
    </div>
  );
}
