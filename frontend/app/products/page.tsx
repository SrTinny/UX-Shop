'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated, clearToken } from '@/lib/auth';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    } else {
      setReady(true);
    }
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products', {
        params: { page: 1, perPage: 20, search: search || undefined },
      });
      const data = res.data as { items?: Product[] };
      setItems(data.items ?? []);
      if ((data.items ?? []).length === 0) {
        toast.info('Nenhum produto encontrado.');
      }
    } catch (e: unknown) {
      let msg = 'Erro ao carregar produtos';
      if (axios.isAxiosError(e)) {
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  async function addToCart(productId: string) {
    try {
      setAddingId(productId);
      await api.post('/cart/items', { productId, quantity: 1 });
      toast.success('Item adicionado ao carrinho!');
    } catch (e: unknown) {
      let msg = 'Erro ao adicionar ao carrinho';
      if (axios.isAxiosError(e)) {
        msg = (e.response?.data as { message?: string } | undefined)?.message ?? e.message ?? msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setAddingId(null);
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <div className="flex items-center gap-2">
          <a href="/cart" className="text-sm underline">Meu carrinho</a>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex gap-2 pt-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={load} className="bg-black text-white px-4 py-2 rounded">
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!error && items.length === 0 && !loading && (
        <p className="text-sm text-gray-600">Nenhum produto encontrado.</p>
      )}

      <ul className="grid gap-3">
        {items.map((p) => (
          <li key={p.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
              <div className="text-sm mt-1">R$ {p.price.toFixed(2)} · estoque: {p.stock}</div>
            </div>
            <button
              disabled={p.stock <= 0 || addingId === p.id}
              onClick={() => addToCart(p.id)}
              className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
              title={p.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
            >
              {addingId === p.id ? 'Adicionando…' : 'Adicionar'}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
