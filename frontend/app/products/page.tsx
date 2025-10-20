'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  // search agora vem da query string
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

  // cancelamento
  const abortRef = useRef<AbortController | null>(null);

  // página de produtos agora pública — não redirecionamos para /login aqui

  // sincroniza `search` com o query param (quando o header navega para /products?search=...)
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const q = searchParams?.get('search') ?? '';
      setSearch(q);
      // busca imediata quando a query string muda
      void fetchProducts({ term: q.trim(), page: 1 });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

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

  // carga inicial (pública): buscar carrinho só se autenticado
  useEffect(() => {
    void fetchCartQty();
    // nota: a busca de produtos será disparada pelo efeito de `searchParams` acima
  }, [fetchCartQty]);

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
        // notify header to refresh badge
        try {
          window.dispatchEvent(new CustomEvent('cart:updated'));
        } catch {}
      toast.success('Item adicionado ao carrinho!');
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
    try {
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch {}
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

      {/* Busca agora no header; removido formulário local para evitar duplicação */}

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
