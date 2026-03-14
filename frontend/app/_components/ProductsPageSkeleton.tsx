import Skeleton from './Skeleton';

export default function ProductsPageSkeleton() {
  return (
    <main className="mx-auto max-w-screen-xl p-6 space-y-6" aria-busy="true" aria-live="polite">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-16 w-full md:w-[420px]" />
      </header>

      <ul className="grid gap-3 auto-rows-fr grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="card p-3">
            <Skeleton className="h-40 w-full mb-3" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4 mb-4" />
            <Skeleton className="h-9 w-28" />
          </li>
        ))}
      </ul>
    </main>
  );
}
