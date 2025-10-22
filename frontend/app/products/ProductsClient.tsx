"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// Link removido (uso centralizado no HeaderBar)
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { addGuestItem } from '@/lib/cart';
import LoginModal from '@/app/components/LoginModal';
import { toast } from 'sonner';
import ProductCard from '@/app/_components/ProductCard';
import FilterBar from '@/app/_components/FilterBar';
import useIntersectionObserver from '@/app/_components/useIntersectionObserver';

/* ===================== Tipos ===================== */
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null; // 👈 adicionado
};

// resposta da API inclui total
type ProductsResponseFull = { items?: Product[]; total?: number };

/* ===================== Página (client) ===================== */
export default function ProductsClient() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PER_PAGE = 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const [sort, setSort] = useState<string>('relevance');
  const [category, setCategory] = useState<string>('');
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const [cartQty, setCartQty] = useState<number>(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingGuestProduct, setPendingGuestProduct] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('ui:density');
      if (v === 'compact') setCompactMode(true);
    } catch {}
  
    const onDensity = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as string;
        setCompactMode(detail === 'compact');
      } catch {}
    };
    window.addEventListener('ui:density:changed', onDensity as EventListener);
    return () => window.removeEventListener('ui:density:changed', onDensity as EventListener);
  }, []);

  const searchParams = useSearchParams();

  const fetchProducts = useCallback(
    async (opts?: {
      term?: string;
      page?: number;
      perPage?: number;
      append?: boolean;
      sort?: string;
      category?: string;
    }) => {
      const {
        term = search,
        page = 1,
        perPage = PER_PAGE,
        append = false,
        sort: sortOpt = sort,
        category: categoryOpt = category,
      } = opts ?? {};

      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        setLoading(true);
        setError(null);

        const params: Record<string, unknown> = { page, perPage };
        if (term) params.search = term;
        if (sortOpt) params.sort = sortOpt;
        if (categoryOpt) params.category = categoryOpt;

        const res = await api.get<ProductsResponseFull>('/products', {
          params,
          signal: ctrl.signal as AbortSignal,
        });

        const list = res.data.items ?? [];
        const totalRes = Number(res.data?.total ?? 0);
        setHasMore(list.length === PER_PAGE);
        setTotal(totalRes);

        if (append) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }

        if (page === 1 && list.length === 0 && (term ?? '').length > 0) {
          toast.info('Nenhum produto encontrado para sua busca.');
        }
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          if (e.code === 'ERR_CANCELED') return;
          if (e.response?.status === 401) {
            toast.error('Sessão expirada. Faça login para gerenciar o carrinho.');
            setError('Sessão expirada');
            return;
          }
          const msg =
            (e.response?.data as { message?: string } | undefined)?.message ??
            e.message ??
            'Erro ao carregar produtos';
          setError(msg);
          toast.error(msg);
        } else if (e instanceof Error) {
          setError(e.message);
          toast.error(e.message);
        } else {
          setError('Erro ao carregar produtos');
          toast.error('Erro ao carregar produtos');
        }
      } finally {
        setLoading(false);
      }
    },
    [search, sort, category],
  );

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const q = searchParams?.get('search') ?? '';
    const s = searchParams?.get('sort') ?? 'relevance';
    const c = searchParams?.get('category') ?? '';

    setSearch(q);
    setSort(s);
    setCategory(c);

    void fetchProducts({ term: q.trim(), page: 1, sort: s, category: c });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await api.get('/categories');
        if (!mounted) return;
        setCategoriesList(res.data ?? []);
      } catch {}
    })();

    const onCategoriesChanged = (e: Event) => {
      // if event includes detail with the new category name, apply it to search params
      try {
        const detail = (e as CustomEvent).detail as string | undefined;
        if (detail) {
          const sp = new URLSearchParams(Array.from(searchParams.entries()));
          sp.set('category', detail);
          const url = `/products?${sp.toString()}`;
          router.push(url);
        } else {
          // refresh categories list
          void (async () => {
            try {
              const res = await api.get('/categories');
              if (!mounted) return;
              setCategoriesList(res.data ?? []);
            } catch {}
          })();
        }
      } catch {}
    };

    window.addEventListener('categories:changed', onCategoriesChanged as EventListener);
    return () => { mounted = false; window.removeEventListener('categories:changed', onCategoriesChanged as EventListener); };
  }, [router, searchParams]);

  

  const fetchCartQty = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        setCartQty(0);
        return;
      }
      const res = await api.get('/cart');
      const total = (res.data?.items ?? []).reduce(
        (acc: number, it: { quantity: number }) => acc + it.quantity,
        0,
      );
      setCartQty(total);
    } catch {
      setCartQty(0);
    }
  }, []);

  useEffect(() => {
    void fetchCartQty();
  }, [fetchCartQty]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await fetchProducts({ term: search.trim(), page: next, append: true });
  }, [hasMore, loading, page, fetchProducts, search]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const e = entries[0];
      if (!e) return;
      if (e.isIntersecting && hasMore && !loading) {
        void loadMore();
      }
    },
    [hasMore, loading, loadMore],
  );

  useIntersectionObserver({ target: sentinelRef, onIntersect: handleIntersect, enabled: hasMore && !loading });

  async function addToCart(productId: string) {
    if (!isAuthenticated()) {
      setPendingGuestProduct(productId);
      setShowLoginModal(true);
      return;
    }

    const prev = cartQty;
    setCartQty((q) => q + 1);

    try {
      await api.post('/cart/items', { productId, quantity: 1 });
      try {
        window.dispatchEvent(new CustomEvent('cart:updated'));
      } catch {}
      toast.success('Item adicionado ao carrinho!');
    } catch (e: unknown) {
      setCartQty(prev);
      let msg = 'Erro ao adicionar ao carrinho';
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
    }
  }

  function handleContinueGuest() {
    if (!pendingGuestProduct) return;
    addGuestItem(pendingGuestProduct, 1);
    setCartQty((q) => q + 1);
    try {
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch {}
    setShowLoginModal(false);
    setPendingGuestProduct(null);
  }

  function handleLoginNow() {
    window.location.href = '/login';
  }

  const hasResults = useMemo(() => items.length > 0, [items]);

  function clearFilters() {
    setSearch('');
    setSort('relevance');
    setCategory('');
    setPage(1);
    const params = new URLSearchParams();
    router.replace(`${pathname}?${params.toString()}`);
    void fetchProducts({ term: '', page: 1, sort: 'relevance', category: '' });
  }

  return (
    <main className="mx-auto max-w-screen-xl p-6 space-y-6">
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginNow}
        onContinueGuest={handleContinueGuest}
      />

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-brand">Produtos</h1>
          <div className="text-sm text-slate-600 mt-1">Exibindo <span className="font-medium">{items.length}</span> de <span className="font-medium">{total}</span> produtos</div>
        </div>

        <div className="w-full md:w-auto mt-3 md:mt-0 flex justify-start">
          <FilterBar
            sort={sort}
            category={category}
            categories={categoriesList}
            onSortChange={async (v) => {
              setPage(1);
              setSort(v);
              const params = new URLSearchParams(searchParams?.toString() ?? '');
              if (search.trim()) params.set('search', search.trim());
              if (v) params.set('sort', v); else params.delete('sort');
              if (category) params.set('category', category);
              router.replace(`${pathname}?${params.toString()}`);
              await fetchProducts({ term: search.trim(), page: 1, sort: v, category });
            }}
            onFilterChange={async (v) => {
              setPage(1);
              setCategory(v);
              const params = new URLSearchParams(searchParams?.toString() ?? '');
              if (search.trim()) params.set('search', search.trim());
              if (sort) params.set('sort', sort);
              if (v) params.set('category', v); else params.delete('category');
              router.replace(`${pathname}?${params.toString()}`);
              await fetchProducts({ term: search.trim(), page: 1, sort, category: v });
            }}
          />
          {/* compact toggle moved to HeaderBar */}
        </div>
      </header>

      {error && (
        <p className="text-red-600 text-sm" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {loading && (
        <ul className={"grid gap-3 auto-rows-fr " + (compactMode ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')} aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="card p-4 animate-pulse">
              <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded mb-3" />
              <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && !hasResults && (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Nenhum produto encontrado para os filtros aplicados. Tente limpar os filtros ou alterar a busca.
          </p>
          <div className="flex justify-center">
            <button onClick={clearFilters} className="btn border border-black/10 dark:border-white/10">
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {!loading && hasResults && (
        <>
          <ul className={"grid gap-3 auto-rows-fr " + (compactMode ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
            {items.map((p) => (
              <ProductCard key={p.id} product={p} searchTerm={search} onAddToCart={addToCart} />
            ))}
          </ul>

          <div aria-hidden>
            {hasMore && (
              <div className="flex justify-center mt-2">
                <div ref={sentinelRef} style={{ width: '1px', height: '1px' }} />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
