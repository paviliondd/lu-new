import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="min-h-[70vh] bg-white px-4 py-20 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Bai viet chua kha dung
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Bai viet nay co the dang la draft, chua co noi dung, hoac chua duoc
          publish trong WordPress.
        </p>
        <Link
          href="/blog"
          replace
          className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Quay lai blog
        </Link>
      </div>
    </main>
  );
}
