'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
// Link removido (uso centralizado no HeaderBar)
import Image from 'next/image'; // 👈 adicionado
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { addGuestItem } from '@/lib/cart';
import LoginModal from '@/app/components/LoginModal';
import { toast } from 'sonner';
import { PlusIcon } from '@/app/components/Icons';

/* ===================== Tipos ===================== */
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null; // 👈 adicionado
};

type ProductsResponse = { items?: Product[] };

/* ===================== Utils ===================== */
const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function clsx(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

/** destaca o termo da busca no nome do produto */
function highlight(text: string, term: string) {
  if (!term) return text;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${safe})`, 'ig');
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="bg-brand/20 text-brand rounded px-0.5">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

/* ===================== Página ===================== */
export default function ProductsPage() {

  // listagem
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // paginação simples
  const PER_PAGE = 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // carrinho (badge)
  const [cartQty, setCartQty] = useState<number>(0);

  // botão adicionar
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingGuestProduct, setPendingGuestProduct] = useState<string | null>(null);

  // debounce + cancelamento
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // página de produtos agora pública — não redirecionamos para /login aqui

  const fetchProducts = useCallback(
    async (opts: { term?: string; page?: number; append?: boolean } = {}) => {
      const { term = search.trim(), page = 1, append = false } = opts;

      // cancela requisição anterior
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        setLoading(true);
        setError(null);

        const res = await api.get<ProductsResponse>('/products', {
          params: { page, perPage: PER_PAGE, search: term || undefined },
          signal: ctrl.signal as AbortSignal,
        });

        const list = res.data.items ?? [];
        setHasMore(list.length === PER_PAGE);

        if (append) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }

        // UX: feedback quando a busca não retorna
        if (page === 1 && list.length === 0 && term.length > 0) {
          toast.info('Nenhum produto encontrado para sua busca.');
        }
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          if (e.code === 'ERR_CANCELED') return; // usuário digitou novamente
          if (e.response?.status === 401) {
            // sessão expirada: avisamos, mas não forçamos redirecionamento nesta página pública
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
    [search],
  );

  const fetchCartQty = useCallback(async () => {
    try {
      // só tenta buscar o carrinho se o usuário estiver autenticado
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

  // carga inicial (pública): sempre buscar produtos, e buscar carrinho só se autenticado
  useEffect(() => {
    void fetchProducts({ page: 1 });
    void fetchCartQty();
  }, [fetchProducts, fetchCartQty]);

  // debounce da busca (reseta paginação)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      void fetchProducts({ term: search.trim(), page: 1 });
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchProducts]);

  async function loadMore() {
    const next = page + 1;
    setPage(next);
    await fetchProducts({ term: search.trim(), page: next, append: true });
  }

  async function addToCart(productId: string) {
    // se não autenticado, abrir modal para escolher login ou continuar como convidado
    if (!isAuthenticated()) {
      setPendingGuestProduct(productId);
      setShowLoginModal(true);
      return;
    }

    // update otimista do badge
    const prev = cartQty;
    setCartQty((q) => q + 1);

    try {
      setAddingId(productId);
      await api.post('/cart/items', { productId, quantity: 1 });
      toast.success('Item adicionado ao carrinho!');
      // notifica header para atualizar badge
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { delta: 1 } }));
    } catch (e: unknown) {
      setCartQty(prev); // desfaz otimista
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
      setAddingId(null);
    }
  }

  function handleContinueGuest() {
    if (!pendingGuestProduct) return;
    addGuestItem(pendingGuestProduct, 1);
    // UX: atualizar badge localmente
    setCartQty((q) => q + 1);
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { delta: 1 } }));
    setShowLoginModal(false);
    setPendingGuestProduct(null);
  }

  function handleLoginNow() {
    // vai para a página de login; após login o cliente deve mesclar o guest cart
    window.location.href = '/login';
  }

  const hasResults = useMemo(() => items.length > 0, [items]);

  

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginNow}
        onContinueGuest={handleContinueGuest}
      />
      {/* Top bar local (apenas título) */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand">Produtos</h1>
      </header>

      {/* Busca */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          void fetchProducts({ term: search.trim(), page: 1 });
        }}
      >
        <div className="relative flex-1">
          <input
            className="input-base pl-9"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar produtos por nome"
          />
          {/* ícone */}
          <svg
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          title="Buscar"
          aria-busy={loading}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-600 text-sm" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {/* Skeleton */}
      {loading && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
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

      {/* Estado vazio */}
      {!loading && !error && !hasResults && (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Nenhum produto encontrado. Tente outra busca.
          </p>
        </div>
      )}

      {/* Lista */}
      {!loading && hasResults && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.id} className="card p-4 flex flex-col gap-3">
                {/* Imagem */}
                <div className="relative w-full aspect-[3/2] overflow-hidden rounded-xl bg-black/5">
                  <Image
                    src={p.imageUrl ?? '/placeholder.png'}
                    alt={p.name}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover"
                    // unoptimized // <- descomente para testar sem otimização
                  />
                </div>

                {/* Texto */}
                <div className="flex-1 min-h-20">
                  <h3 className="font-medium">{highlight(p.name, search.trim())}</h3>
                  {p.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-semibold">{formatBRL(p.price)}</div>
                    <div
                      className={clsx(
                        'mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs',
                        p.stock > 0
                          ? 'bg-accent/10 text-accent'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
                      )}
                      title={`Estoque: ${p.stock}`}
                    >
                      {p.stock > 0 ? `Estoque: ${p.stock}` : 'Sem estoque'}
                    </div>
                  </div>

                  <button
                    disabled={p.stock <= 0 || addingId === p.id}
                    onClick={() => addToCart(p.id)}
                    className="inline-flex items-center gap-2 rounded-md bg-brand text-white px-3 py-2 text-sm hover:opacity-95 disabled:opacity-60"
                    title={p.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
                    aria-disabled={p.stock <= 0 || addingId === p.id}
                  >
                    {addingId === p.id ? 'Adicionando…' : <><PlusIcon className="h-4 w-4" />Adicionar</>}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginação / Carregar mais */}
          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                className="btn border border-black/10 dark:border-white/10 mt-2"
                disabled={loading}
              >
                {loading ? 'Carregando…' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
