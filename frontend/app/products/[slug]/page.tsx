"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { addGuestItem } from '@/lib/cart';
import { toast } from 'sonner';
import ProductCard from '@/app/_components/ProductCard';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: { id: string; name: string } | null;
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ProductPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug ?? '';
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // try a targeted search by slug
        const res = await api.get('/products', { params: { search: slug, perPage: 10 } });
        const items: Product[] = res.data.items ?? [];
        let p = items.find((it) => it.slug === slug);
        if (!p) {
          // fallback: fetch more items and search
          const res2 = await api.get('/products', { params: { perPage: 50 } });
          const items2: Product[] = res2.data.items ?? [];
          p = items2.find((it) => it.slug === slug);
        }
        if (!mounted) return;
        if (!p) {
          toast.error('Produto não encontrado');
          router.push('/products');
          return;
        }
        setProduct(p);

        // fetch related products by category if available
        if (p.category?.name) {
          try {
            const rel = await api.get('/products', { params: { category: p.category.name, perPage: 8 } });
            const relItems: Product[] = (rel.data.items ?? []).filter((r: Product) => r.slug !== p.slug);
            setRelated(relItems);
          } catch {}
        }
      } catch {
        toast.error('Erro ao carregar produto');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [slug, router]);

  async function handleAddToCart() {
    if (!product) return;
    if (!isAuthenticated()) {
      addGuestItem(product.id, 1);
      try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
      toast.success('Item adicionado ao carrinho (convidado)');
      return;
    }
    if (adding) return;
    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
      toast.success('Item adicionado ao carrinho');
    } catch (err) {
      let msg = 'Erro ao adicionar ao carrinho';
      try {
        const ee = err as unknown as { response?: { data?: { message?: string } }; message?: string };
        if (ee?.response?.data?.message) msg = ee.response.data.message;
        else if (ee?.message) msg = ee.message;
      } catch {}
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    if (!product) return;
    await handleAddToCart();
    router.push('/cart');
  }

  function handleLike() {
    setLiked((s) => !s);
    toast.success(liked ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = { title: product?.name ?? 'Produto', text: product?.description ?? '', url };
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as unknown as Navigator & { share?: (data: unknown) => Promise<void> }) : undefined;
      if (nav?.share) {
        await nav.share(shareData);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado para a área de transferência');
      } else {
        toast.error('Compartilhamento não suportado');
      }
    } catch {
      toast.error('Falha ao compartilhar');
    }
  }

  if (loading) return <main className="mx-auto max-w-screen-xl p-6">Carregando…</main>;
  if (!product) return <main className="mx-auto max-w-screen-xl p-6">Produto não encontrado</main>;

  return (
    <main className="mx-auto max-w-screen-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
            <Image src={product.imageUrl ?? '/placeholder.png'} alt={product.name} width={1200} height={900} className="object-cover w-full h-auto" />
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">{formatBRL(product.price)}</div>
            <div className="text-sm">
              {product.stock > 0 ? <span className="text-green-600">Em estoque: {product.stock}</span> : <span className="text-red-600">Sem estoque</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleLike} aria-pressed={liked} aria-label={liked ? 'Remover dos favoritos' : 'Curtir'} className={`p-2 rounded-md border ${liked ? 'bg-brand text-white' : ''}`}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
            </button>
            <button onClick={handleShare} aria-label="Compartilhar" className="p-2 rounded-md border">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><path d="M8.59 13.51L15.42 8.49"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button onClick={handleAddToCart} disabled={product.stock <= 0 || adding} className="btn bg-brand text-white px-4 py-2 rounded">{adding ? '…' : 'Adicionar ao carrinho'}</button>
            <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn border px-4 py-2 rounded">Compre agora</button>
          </div>

          <div className="mt-4">
            <h2 className="font-semibold">Descrição</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{product.description ?? 'Sem descrição disponível.'}</p>
          </div>

          <div className="mt-4 text-sm text-slate-500">Vendas: <span className="font-medium">Dados de vendas indisponíveis</span></div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Produtos relacionados</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} searchTerm="" onAddToCart={async (id: string) => {
                if (!isAuthenticated()) { addGuestItem(id, 1); toast.success('Item adicionado ao carrinho (convidado)'); return; }
                try { await api.post('/cart/items', { productId: id, quantity: 1 }); window.dispatchEvent(new CustomEvent('cart:updated')); toast.success('Item adicionado ao carrinho'); } catch { toast.error('Erro'); }
              }} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
